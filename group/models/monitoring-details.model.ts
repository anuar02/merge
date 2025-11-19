export interface MonitoringDetails {
    monitoringType: string; // Тип мониторинга (One Time, Regular)
    collectedSections: string[]; // Сущности
    regularPeriod: {
        start: string; // Дата начала сбора
        end: string; // Дата окончания сбора
    };
    oneTimeStart: string;
}