import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'

if (process.env.OTEL_ENABLED == '1') {
    const sdk = new NodeSDK({
        resource: resourceFromAttributes({
            [ATTR_SERVICE_NAME]: 'epi-flipboard-webserver',
        }),
        spanProcessor: new SimpleSpanProcessor(
            new OTLPTraceExporter({
                url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
            })
        ),
    })

    sdk.start()
}
