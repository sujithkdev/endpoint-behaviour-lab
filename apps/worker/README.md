# Worker process boundary

Not implemented. The demo API never enqueues or executes jobs.

The production worker will use the jobs application port, acquire a bounded lease transactionally, perform only allowlisted domain work, renew leases, record outcomes and publish outbox events. Delivery is at least once; handlers must tolerate duplicates. Agent commands require identity, signature, expiry and approval verification before execution. Do not add a general remote-shell command endpoint.

See the implementation paper for lifecycle, recovery, cancellation and integration gates.
