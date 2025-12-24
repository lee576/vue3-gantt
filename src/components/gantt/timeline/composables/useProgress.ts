import { computed, ref } from 'vue';

export function useProgress(props: any, emit: any, mapFields: any) {
    const isProgressDragging = ref(false);
    const progress = computed(() => {
        const progressValue = Number(props.row[mapFields.progress]);
        if (isNaN(progressValue)) return '0.00%';
        return (progressValue * 100).toFixed(2) + '%';
    });

    const emitProgressUpdate = (newProgress: number) => {
        const detail = {
            taskId: props.row[mapFields.id],
            oldProgress: Number(props.row[mapFields.progress]) || 0,
            newProgress: newProgress,
            task: props.row
        };
        emit('progress-update', detail);
        window.dispatchEvent(new CustomEvent('taskProgressUpdate', { detail }));
        console.log('Task progress updated:', detail);
    };

    return { progress, isProgressDragging, emitProgressUpdate };
}
