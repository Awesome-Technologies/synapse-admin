# Contributing to [etkecc/synapse-admin](https://github.com/etkecc/synapse-admin)

While etke.cc fork is intended to accept more QoL changes and features, 
it's good idea to open PR into the upstream repo: [Awesome-Technologies/Synapse-Admin](https://github.com/Awesome-Technologies/synapse-admin).

1. Use the etkecc/synapse-admin **master** branch as your branch upstream: `git checkout master; git pull; git checkout -b my-new-feature`
2. Once your changes are ready, please, open **2** PRs: one from your branch to `Awesome-Technologies/Synapse-Admin` **master**, and another one to `etkecc/synapse-admin` **main**
3. Once PR is accepted in the `etkecc/synapse-admin`, update `README.md` file (either directly in the `main` branch, or via another PR) to add link to the merged PR in the [Fork differences](https://github.com/etkecc/synapse-admin#fork-differences) section

4. **Why?**

5. The upstream project may not want to accept all the changes, so to ensure they are not lost, we will gladly add them to the etke.cc fork.
6. Unfortunately, it's challenging to keep changes separated, so to avoid messing upstream and fork changes (e.g., CI changes that should not be pushed to the upstream, as they intended for this fork specifically),
7. there are 2 branches:
8.
9. * `master` - read-only copy of upstream's master branch to easily sync changes, and use it as base for new PRs
   * `main` - fork-own branch with all changes
