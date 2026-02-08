# 🚀 Distributed Fault-Tolerant Task Scheduler

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

A high-throughput, distributed background job system inspired by **BullMQ** and **Sidekiq**.

This system handles asynchronous task processing, delayed job scheduling, and ensures **At-Least-Once Delivery** through robust crash recovery mechanisms. It includes a real-time React dashboard for observability.

---

## 🏗 System Architecture

The system uses a **Producer-Consumer** pattern with **Redis** as the message broker.

```mermaid
graph TD
    Client[Client / API] -->|POST /tasks| Producer
    Producer -->|Immediate Task| Q1[(Redis List: task-queue)]
    Producer -->|Delayed Task| Q2[(Redis ZSet: delayed)]

    subgraph "Orchestration Layer"
        Scheduler[Scheduler Service] -- Polls ZSet --> Q2
        Scheduler -- Promotes Due Tasks --> Q1
    end

    subgraph "Processing Layer"
        Worker[Worker Node] -- BLMOVE --> Q1
        Worker -- Atomic Move --> Q3[(Processing Queue)]
        Worker -- Execute --> Task[Execute Task]
        Task -- Success --> Done[Remove from Q3 + Log Stats]
    end

    subgraph "Reliability Layer"
        Recovery[Recovery Daemon] -- Checks Stale Tasks --> Q3
        Recovery -- RPOPLPUSH --> Q1
    end
```
