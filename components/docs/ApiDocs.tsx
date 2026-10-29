"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";


const plugins = [() => ({ components: { onlineValidatorBadge: () => null } })];

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
    ssr: false,
    loading: () => <p className="p-6 text-center text-gray-500">Loading API documentation...</p>,
});

export default function ApiDocs() {
    return (
        <SwaggerUI
            url="/api/docs"
            withCredentials
            persistAuthorization={false}
            plugins={plugins}
            filter
            deepLinking={false}
            docExpansion="list"
            defaultModelsExpandDepth={0}
            requestInterceptor={(request) => {
                request.credentials = "same-origin";
                return request;
            }}
        />
    );
}
