/// <reference path="../pb_data/types.d.ts" />

migrate(
    (app) => {
        const collection = new Collection({
            type: "base",
            name: "prospects_colissimo",
            fields: [
                {
                    name: "domain",
                    type: "text",
                    required: true,
                    presentable: true,
                    max: 253,
                    pattern: "^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$",
                },
                {
                    name: "email",
                    type: "email",
                    required: false,
                },
                {
                    name: "phone",
                    type: "text",
                    required: false,
                    max: 40,
                },
                {
                    name: "status",
                    type: "select",
                    required: true,
                    maxSelect: 1,
                    values: ["a_prospecter", "en_attente", "archive"],
                },
                {
                    name: "notes",
                    type: "text",
                    required: false,
                    max: 5000,
                },
                {
                    name: "created",
                    type: "autodate",
                    onCreate: true,
                },
                {
                    name: "updated",
                    type: "autodate",
                    onCreate: true,
                    onUpdate: true,
                },
            ],
            indexes: [
                "CREATE UNIQUE INDEX `idx_prospects_colissimo_domain` ON `prospects_colissimo` (`domain`)",
                "CREATE INDEX `idx_prospects_colissimo_status` ON `prospects_colissimo` (`status`)",
            ],
        });

        return app.save(collection);
    },
    (app) => {
        const collection = app.findCollectionByNameOrId("prospects_colissimo");
        return app.delete(collection);
    }
);
