
const TIME_ZONE = 'America/Lima';
const LOCALE = 'es-PE';

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
});

/**
 * Detecta fechas sin hora (YYYY-MM-DD).
 */
function isDateOnly(date: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Convierte una fecha en Date.
 * Las fechas sin hora se interpretan como fecha de calendario local.
 * Las fechas con hora conservan su instante y zona horaria.
 */
function parseDate(date: string): Date {
    if (isDateOnly(date)) {
        const [year, month, day] = date.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
    }

    return new Date(date);
}

export function formatDateTime(date: string): string {
    const parsed = parseDate(date);
    return dateTimeFormatter.format(parsed);
}

export function getDay(date: string): string {
    const parsed = parseDate(date);

    if (isDateOnly(date)) {
        return date.split('-')[2];
    }

    return new Intl.DateTimeFormat(LOCALE, {
        timeZone: TIME_ZONE,
        day: '2-digit',
    }).format(parsed);
}

export function getMonth(date: string): string {
    const parsed = parseDate(date);

    if (isDateOnly(date)) {
        const month = Number(date.split('-')[1]);

        return new Intl.DateTimeFormat(LOCALE, {
            month: 'long',
            timeZone: TIME_ZONE,
        }).format(new Date(2020, month - 1, 15, 12));
    }

    return new Intl.DateTimeFormat(LOCALE, {
        timeZone: TIME_ZONE,
        month: 'long',
    }).format(parsed);
}

export function formatDate(date: string): string {
    const fecha = date.substring(0, 10);
    const [year, month, day] = fecha.split('-').map(Number);

    const corregida = new Date(Date.UTC(year, month - 1, day, 12));

    return new Intl.DateTimeFormat('es-PE', {
        timeZone: 'UTC',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(corregida);
}

export function formatDateShort(date: string): string {
    return shortDateFormatter.format(parseDate(date));
}

/**
 * Calcula los días restantes usando días de calendario en Perú.
 */
export function getRemainingDays(date: string): number {
    const target = parseDate(date);

    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(target);

    const getPart = (type: string) =>
        Number(parts.find(part => part.type === type)?.value);

    const targetUTC = Date.UTC(
        getPart('year'),
        getPart('month') - 1,
        getPart('day')
    );

    const todayParts = new Intl.DateTimeFormat('en-CA', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());

    const getTodayPart = (type: string) =>
        Number(todayParts.find(part => part.type === type)?.value);

    const todayUTC = Date.UTC(
        getTodayPart('year'),
        getTodayPart('month') - 1,
        getTodayPart('day')
    );

    return Math.round(
        (targetUTC - todayUTC) / (1000 * 60 * 60 * 24)
    );
}
