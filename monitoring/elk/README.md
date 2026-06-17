# ELK Monitoring

Local ELK stack:

```bash
cd monitoring/elk
docker compose -f docker-compose.elk.yml up -d
```

Open Kibana:

```text
http://127.0.0.1:5601
```

Kubernetes log shipping:

```bash
kubectl apply -f monitoring/filebeat/filebeat-daemonset.yaml
```

For production, prefer Elastic Cloud or a managed OpenSearch/Elasticsearch deployment, then update the Filebeat output target.
