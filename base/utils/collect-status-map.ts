import { ChipColor } from '../../../../shared/components/badge/badge.component';

export type CollectStatus = 'CREATED' | 'IN_PROGRESS' | 'FINISHED' | 'ERROR'
type CollectStatusMap = Record<CollectStatus, {
    color: ChipColor;
    label: string;
    icon?: string;
}>

export const COLLECT_STATUS_MAP: CollectStatusMap = {
    CREATED: {
        color: 'default',
        label: 'accounts.collectionStatuses.created'
    },
    IN_PROGRESS: {
        color: 'primary',
        label: 'accounts.collectionStatuses.inProgress',
    },
    FINISHED: {
        color: 'success',
        label: 'accounts.collectionStatuses.finished'
    },
    ERROR: {
        color: 'error',
        label: 'accounts.collectionStatuses.error'
    }
}