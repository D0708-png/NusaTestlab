# Commit Strategy

NusaTestLab menggunakan strategi commit major selama fase pengembangan awal.

## Major Commit Plan

### Commit 1

```bash
git commit -m "chore: initialize nusa-testlab standalone project"
```

## Isi

- struktur project
- konfigurasi TypeScript
- CLI awal
- environment example
- README awal
- dokumentasi awal

### Commit 2

```bash
git commit -m "feat: add core testing engine"
```

### Commit 3

```bash
git commit -m "feat: add target SaaS configuration and HTTP connector"
```

### Commit 4

```bash
git commit -m "feat: add SaaS profile system"
```

### Commit 5

```bash
git commit -m "feat: add ai-umkm testing profile"
```

### Commit 6

```bash
git commit -m "feat: add dummy data generator and business validators"
```

### Commit 7

```bash
git commit -m "feat: add basic security testing engine"
```

### Commit 8

```bash
git commit -m "docs: add standalone SaaS testing documentation"
```

### Commit 9

```bash
git commit -m "release: nusa-testlab MVP v0.1.0"
```

## Minor Commit

Minor commit dilakukan setelah MVP sudah jadi, misalnya:

```bash
git commit -m "fix: correct stock validation calculation"
git commit -m "docs: update integration guide"
git commit -m "refactor: simplify report formatter"
