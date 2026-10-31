export function formatDateTime(date: string): string {
    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(date))
}


export function getDay(date: string): string {
    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
    }).format(new Date(date))
}

export function getMonth(date: string): string {
    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        month: 'long',
    }).format(new Date(date))
}

export function formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date))
}

export function formatDateShort(date: string): string {
    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'America/Lima',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date))
}


export function getRemainingDays(date: string): number {
    const fechaVencimiento = new Date(date);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaVencimiento.setHours(0, 0, 0, 0);
    return Math.ceil(
        (fechaVencimiento.getTime() - hoy.getTime()) /
        (1000 * 60 * 60 * 24)
    );
}