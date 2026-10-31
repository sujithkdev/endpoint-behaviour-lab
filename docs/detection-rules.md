# Initial detection scenarios — specifications, not executable rules

All scenarios are tested in authorised isolated VMs. An alert indicates suspicious evidence, not confirmed malware. Generic names alone are weak signals.

| ID | Scenario and necessary evidence | Benign control | Missing-data outcome |
|---|---|---|---|
| B01 | Configured document application launches scripting process; Sysmon process creation with device, process and parent identity, image, command line and timestamps | Approved automation launched through a document workflow | Missing parent or command-line context is partial evidence |
| B02 | Process modifies a configured startup-persistence location; registry/file event linked to process creation | Legitimate installer or updater establishing startup behaviour | No originating process identity produces an incomplete timeline |
| B03 | Process creates an executable that subsequently executes; file-create and process-create evidence on same device with path and available hashes/identity | Legitimate installer downloading and running a package | Path-only association is weaker/inferred; replacement or absent hash cannot be ignored |

B01 is a baseline candidate rule, not a malware verdict. B02 requires an explicit versioned location list. B03 must account for path normalization and file replacement. Use exact evidence relationships, not merely events occurring nearby in time.

Initial windows and allowlists are lab configuration, tuned on development traces and then frozen before evaluation. Record every suppression and excluded source. An optional DNS/network enrichment is separate from the required initial sequence; enabling it must include collection-cost measurement.

Rule files are reserved in rules/. Do not install an executable-looking rule until the rule schema, engine and positive/negative fixtures exist. Independently authored rules must cite any external rule sources and retain their licences.
