import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import { catalogSlug } from "@/lib/catalog-url";

loadEnvConfig(process.cwd());

async function main() {
    const { connectDB } = await import("@/lib/db");
    const { default: Product } = await import("@/models/Product");
    const { default: Category } = await import("@/models/Category");
    const apply = process.argv.includes("--apply");
    await connectDB();
    try {
        for (const model of [Product, Category]) {
            const records = await model.collection.find({ slug: null }, { projection: { name: 1 } }).toArray();
            console.log(`${model.modelName}: ${records.length} missing slugs (${apply ? "apply" : "dry run"}).`);
            if (!apply) continue;
            await model.collection.createIndex({ slug: 1 }, { unique: true, partialFilterExpression: { slug: { $type: "string" } } });
            let updated = 0;
            for (const record of records) {
                if (typeof record.name !== "string") throw new Error("A catalog record is missing its name.");
                const result = await model.collection.updateOne({ _id: record._id, name: record.name, slug: null }, {
                    $set: { slug: catalogSlug(record.name, String(record._id)) },
                });
                updated += result.modifiedCount;
            }
            console.log(`${model.modelName}: ${updated} slugs saved. Existing slugs and timestamps preserved.`);
        }
    } finally { await mongoose.disconnect(); }
}

main().catch(() => {
    console.error("Slug migration failed. Check database access and existing slug indexes; no existing slugs are overwritten.");
    process.exitCode = 1;
});
