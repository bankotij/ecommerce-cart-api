# Commerce contract laboratory

## Current evidence

Prices, coupon milestones and immutable order snapshots are tested.

## Next product increment — planned

Add persistent storage and transactional single-use coupon consumption.

## Acceptance gate

Two concurrent uses of a code produce one successful consumption; orders survive restart.

A release also needs reproducible checks, useful empty/error states, keyboard/mobile review where applicable, and an inspectable example with appropriate data. Planned work above is not shipped functionality.
