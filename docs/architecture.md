# Architecture

NusaTestLab menggunakan pendekatan profile-based testing.

## High-Level Architecture

```txt
NusaTestLab CLI
    |
    v
Core Testing Engine
    |
    v
Scenario Loader
    |
    v
HTTP API Connector
    |
    v
Target SaaS API
    |
    v
Assertion Engine
    |
    v
Report Generator
```

# Main Components

## Core Testing Engine

Menjalankan seluruh test scenario berdasarkan profile yang dipilih.

## Scenario Loader

Membaca daftar scenario dari folder profile.

## HTTP API Connector

Menghubungkan NusaTestLab dengan API target SaaS.

## Assertion Engine

Membandingkan expected result dengan actual result.

## Report Generator

Membuat hasil test dalam format JSON dan Markdown.
