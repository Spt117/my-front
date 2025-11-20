module.exports = {
    apps: [
        {
            name: "my-front",
            script: "node_modules/.bin/next",
            args: "start",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "10G",
            exec_mode: "fork",
            env: {
                PORT: 3005,
            },
        },
    ],
};
