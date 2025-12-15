export type FilterFieldType =
    | 'platforms'
    | 'dateRange'
    | 'numberRange'
    | 'checkbox'
    | 'checkboxList'
    | 'tags';

export interface FilterOption {
    value: string | boolean | number;
    label: string;
    count?: number;
}

export interface FilterField {
    key: string;
    type: FilterFieldType;
    label: string;
    placeholder?: string;
    options?: FilterOption[];
    min?: number;
    max?: number;
    defaultValue?: any;
    subsections?: FilterSubsection[];
}

export interface FilterSubsection {
    title: string;
    hasCheckbox?: boolean;
    fields: FilterField[];
}

export interface FilterSection {
    title: string;
    collapsed?: boolean;
    hasCheckbox?: boolean;
    subsections?: FilterSubsection[];
    fields?: FilterField[];
}

export interface FilterConfig {
    sections: FilterSection[];
}

export interface FilterFormValue {
    platforms?: string[];
    dateRange?: { start: string; end: string };
    [key: string]: any;
}
