import { ref } from "vue";
import { store } from "../../state/Store";
import { calcQuarterPosition, calcMonthPosition, calcDayPosition, calcWeekPosition, calcHourPosition } from "../utils/dateCalc";

export function useBarGeometry(props: any, mapFields: any) {
    const oldBarDataX = ref(0);
    const oldBarWidth = ref(0);

    const computePosition = () => {
        let dataX = 0;
        let width = 0;
        let takestime = '';
        const mode = store.mode;
        const start = props.startGanttDate;
        const startDate = props.row[mapFields.startdate];
        const endDate = props.row[mapFields.enddate];
        const scale = store.scale;

        if (mode === '季度') {
            const res = calcQuarterPosition(start, startDate, endDate, scale);
            dataX = res.dataX; width = res.width; takestime = res.takestime;
        } else if (mode === '月') {
            const res = calcMonthPosition(start, startDate, endDate, scale);
            dataX = res.dataX; width = res.width; takestime = res.takestime;
        } else if (mode === '日') {
            const res = calcDayPosition(start, startDate, endDate, scale, store.daySubMode === 'half');
            dataX = res.dataX; width = res.width; takestime = res.takestime;
        } else if (mode === '周') {
            const res = calcWeekPosition(start, startDate, endDate, scale);
            dataX = res.dataX; width = res.width; takestime = res.takestime;
        } else if (mode === '时') {
            const res = calcHourPosition(start, startDate, endDate, scale, parseInt(store.hourSubMode || '60'));
            dataX = res.dataX; width = res.width; takestime = res.takestime;
        }

        oldBarDataX.value = dataX;
        oldBarWidth.value = width;
        props.row[mapFields.takestime] = takestime;
        return { dataX, width };
    };

    return { oldBarDataX, oldBarWidth, computePosition };
}
