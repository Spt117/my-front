export const isValidEmailByRegex = (mail: string) => {
    const regex = /^[^@]{3,}@[^@]+\.[^@]+$/;
    return !regex.test(mail);
};

export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const dateFormatted = (date: number) => {
    return new Date(date).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    });
};
