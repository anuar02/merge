export interface MonitoringDetails {
    monitoringType: string; // Тип мониторинга (One Time, Regular)
    collectedSections: string[]; // Сущности
    regularPeriod: {
        start: string | undefined; // Дата начала сбора
        end: string | undefined; // Дата окончания сбора
    };
    oneTimeStart?: string | null;
}
