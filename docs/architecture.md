# Smart Queue System: Distributed Appointment Booking Architecture

## 1) High-Level Architecture (Text Diagram + Explanation)

### 1.1 System Context Diagram (Text-Based)

```text
Clients (Web/Mobile/Admin)
        |
        v
[Nginx API Gateway / Reverse Proxy]
        |
        +------------------------+------------------------+
        |                        |                        |
        v                        v                        v
[auth-service]         [appointment-service]     [payment-service]
  - JWT auth             - Appointment CRUD         - Payment workflow
  - Profile APIs         - Queue/cache logic        - Retry/idempotency
                         - Saga initiator           - Saga participant
        |                        |                        |
        +------------+-----------+-----------+------------+
                     |                       |
                     v                       v
                 [MongoDB]             [Redis]
             (system of record)   (cache + pub/sub event bus)
```

### 1.2 Request and Event Flow

1. Client traffic enters through Nginx.
2. Nginx routes requests by path:
   - `/api/auth*` -> `auth-service`
   - `/api/pay*` -> `payment-service`
   - `/api/*` -> `appointment-service`
3. `appointment-service` writes appointment state to MongoDB and may publish domain events.
4. `payment-service` subscribes to `appointment.created`, processes payment, and publishes `payment.success` or `payment.failed`.
5. `appointment-service` subscribes to payment outcome events and applies compensation on failure (cancel appointment), keeping eventual consistency.

This architecture combines synchronous HTTP for user-facing APIs and asynchronous pub/sub for cross-service workflow coordination.

## 2) Scalability Strategy

### 2.1 Horizontal Scaling

- Backend services (`auth`, `appointment`, `payment`) are deployed with `replicas: 2` in Kubernetes.
- Nginx gateway is also deployed with multiple replicas to avoid ingress bottlenecks.
- Kubernetes Services provide load-balanced, stable virtual endpoints for each service.

### 2.2 Stateless Service Design

- Application services are stateless; durable state lives in MongoDB and Redis.
- Stateless design allows independent autoscaling by service based on traffic or queue depth.

### 2.3 Scale Boundaries and Next Steps

- Current event bus is Redis Pub/Sub (simple and fast, but limited delivery guarantees).
- For higher scale/strict durability, migration path is Kafka/RabbitMQ with consumer groups and durable topics/queues.

## 3) Reliability Mechanisms

### 3.1 Health and Self-Healing

- Each backend service exposes `/health`.
- Kubernetes `livenessProbe` and `readinessProbe` gate traffic and automatically restart unhealthy containers.

### 3.2 Failure Handling Patterns

- **Saga compensation:** `appointment-service` compensates on `payment.failed` by cancelling appointments.
- **Retry with exponential backoff:** `payment-service` retries transient failures.
- **Failed-event capture:** failed processing is persisted for investigation/replay.

### 3.3 Consistency and Duplicate Protection

- **API idempotency keys** prevent duplicate payment side effects.
- **Event deduplication store** (`ProcessedEvent`) prevents replaying the same event multiple times.
- Correlation/request IDs are propagated across async boundaries to preserve traceability.

## 4) Caching Strategy

### 4.1 Cache Role

- Redis is used as a read-optimization layer in `appointment-service`.
- Frequently read dashboard/appointments datasets are cached with short TTL (`60s`).

### 4.2 Invalidation Strategy

- On appointment state changes or compensation flows, relevant keys are invalidated (`admin:dashboard:today`, `appointments:today`).
- This balances low read latency with acceptable short-lived staleness.

### 4.3 Resilience Behavior

- If Redis is unavailable, service falls back to MongoDB queries, favoring availability over performance.

## 5) Deployment Pipeline Summary

Current pipeline (`.github/workflows/deploy.yml`) on push to `main`:

1. Checkout source.
2. Set up Node.js 20 and dependency cache.
3. Install backend dependencies.
4. Conditionally run tests (if test script is defined).
5. Set up Docker Buildx.
6. Authenticate to Docker Hub.
7. Build and push backend image tags (`latest` and commit SHA).

### Production Hardening Recommendations

- Build/push per-service images (`auth`, `appointment`, `payment`) instead of one monolithic backend image.
- Add vulnerability scanning (e.g., Trivy/Grype) and policy gates.
- Add progressive deployment stage (staging namespace -> production promotion).

## 6) Kubernetes Orchestration Explanation

The Kubernetes manifests under `k8s/` implement:

- Namespace isolation: `smart-queue`
- Deployments:
  - `auth-service`, `appointment-service`, `payment-service` (2 replicas each)
  - `mongo`, `redis` (stateful dependencies)
  - `nginx` gateway
- Services:
  - ClusterIP for internal east-west communication
  - NodePort (`30080`) for external access via Nginx
- Config management:
  - ConfigMap for non-secret runtime configuration
  - Secret for sensitive values (`JWT_SECRET`)
- PersistentVolumeClaims for MongoDB and Redis data durability
- Resource requests/limits for predictable scheduling and containment

Operationally, Kubernetes provides scheduling, service discovery, rolling updates, restart automation, and traffic gating via readiness.

## 7) Observability Layer Description

### 7.1 Logging

- Structured JSON logging via Pino (with safe fallback logger).
- `x-request-id` generated/propagated per request and included in logs for cross-service correlation.

### 7.2 Metrics

- `/metrics` endpoint exposed per service using `prom-client`.
- HTTP request counters and service-specific business counters are collected:
  - `smart_queue_http_requests_total`
  - payment failure/retry counters
  - appointment compensation cancellation counter

### 7.3 Health Endpoints

- `/health` reports dependency-level health (Mongo, Redis, event bus where relevant).
- Supports both runtime diagnostics and Kubernetes probes.

## 8) Interview-Ready Explanation

### 8.1 60-Second Version

"This is a microservices-based appointment booking platform using API gateway routing, dedicated auth/appointment/payment services, MongoDB for durable state, and Redis for both caching and pub/sub saga orchestration. We use eventual consistency for cross-service workflows: appointment creation triggers payment; payment outcome drives appointment confirmation or compensation. Reliability comes from idempotency keys, event deduplication, retries, health probes, and Kubernetes self-healing. Observability includes structured logs with request IDs plus Prometheus-compatible metrics."

### 8.2 Deep-Dive Talking Points

1. Why pub/sub + saga was chosen:
   - Loose coupling, independent scaling, and resilience to partial outages.
2. How duplicate side effects are prevented:
   - Idempotency at API boundary and dedupe at event-consumer boundary.
3. Why eventual consistency is acceptable:
   - Appointment/payment lifecycle can tolerate asynchronous completion with explicit compensations.
4. How production readiness is achieved:
   - Probe-driven traffic gating, resource limits, persistent storage, and controlled rollout paths.
5. Tradeoffs to acknowledge:
   - Redis Pub/Sub is simple but not fully durable; migrate to durable broker for stricter guarantees at scale.

---

## Appendix: Key Runtime Components

- Gateway: Nginx reverse proxy
- Services: `auth-service`, `appointment-service`, `payment-service`
- Data: MongoDB
- Cache/Event Bus: Redis
- Orchestration: Kubernetes manifests in `k8s/`
- CI/CD: GitHub Actions workflow in `.github/workflows/deploy.yml`

