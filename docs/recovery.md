# Recovery design — pending implementation

Checkpoint source exports after confirmed publication; duplicate publication is possible on restart. Persist detector state and alert/event changes transactionally before acknowledging consumption. Exactly-once delivery is not assumed.
Maintain bounded queue and source retention; document gaps caused by outages longer than those bounds. Record losses explicitly. A downstream queue cannot recover events never collected upstream.
Back up application data, migrations, rule/configuration versions and protected identity material through appropriate separate handling. Never commit credentials or collected logs to Git.
Test restoration into an independent database and reconcile checkpoints with retained source data, queue contents and alert evidence. Test failed migrations and rule rollback before upgrades are considered supported.
