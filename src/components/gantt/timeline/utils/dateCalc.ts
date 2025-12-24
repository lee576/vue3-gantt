import dayjs from 'dayjs';
import { t } from "../../i18n";

export function calcQuarterPosition(start: string, taskStart: string, taskEnd: string, scale: number) {
    const ganttStartQuarter = dayjs(start).startOf('quarter');
    const taskStartQuarter = dayjs(taskStart).startOf('quarter');
    const taskEndQuarter = dayjs(taskEnd).startOf('quarter');

    const fromStartQuarters = (taskStartQuarter.year() - ganttStartQuarter.year()) * 4 +
        (taskStartQuarter.quarter() - ganttStartQuarter.quarter());
    const dataX = scale * fromStartQuarters;

    const spendQuarters = (taskEndQuarter.year() - taskStartQuarter.year()) * 4 +
        (taskEndQuarter.quarter() - taskStartQuarter.quarter()) + 1;
    return { dataX, width: spendQuarters * scale, takestime: spendQuarters + t('durationUnit.quarters') };
}

export function calcMonthPosition(start: string, taskStart: string, taskEnd: string, scale: number) {
    const ganttStartMonth = dayjs(start).startOf('month');
    const taskStartMonth = dayjs(taskStart).startOf('month');
    const taskEndMonth = dayjs(taskEnd).startOf('month');

    const fromStartMonths = (taskStartMonth.year() - ganttStartMonth.year()) * 12 +
        (taskStartMonth.month() - ganttStartMonth.month());
    const dataX = scale * fromStartMonths;

    const spendMonths = (taskEndMonth.year() - taskStartMonth.year()) * 12 +
        (taskEndMonth.month() - taskStartMonth.month()) + 1;
    return { dataX, width: spendMonths * scale, takestime: spendMonths + t('durationUnit.months') };
}

export function calcDayPosition(start: string, taskStart: string, taskEnd: string, scale: number, isHalfDay: boolean) {
    const cellsPerDay = isHalfDay ? 2 : 1;
    const fromPlanStartDays = dayjs(taskStart).diff(dayjs(start), 'days');
    let dataX: number;
    let width: number;

    if (isHalfDay) {
        const startHour = dayjs(taskStart).hour();
        const endHour = dayjs(taskEnd).hour();
        const startIsAM = startHour < 12;
        const endIsAM = endHour < 12;

        const startCellOffset = startIsAM ? 0 : 1;
        const endCellOffset = endIsAM ? 0 : 1;

        dataX = scale * (fromPlanStartDays * 2 + startCellOffset);

        const endDays = dayjs(taskEnd).diff(dayjs(start), 'days');
        const endCellIndex = endDays * 2 + endCellOffset;
        const startCellIndex = fromPlanStartDays * 2 + startCellOffset;

        width = (endCellIndex - startCellIndex + 1) * scale;
    } else {
        dataX = scale * fromPlanStartDays * cellsPerDay;
        const spendDays = dayjs(taskEnd).diff(dayjs(taskStart), 'days') + 1;
        width = spendDays * scale * cellsPerDay;
    }

    const spendDays = dayjs(taskEnd).diff(dayjs(taskStart), 'days') + 1;
    return { dataX, width, takestime: spendDays + t('durationUnit.days') };
}

export function calcWeekPosition(start: string, taskStart: string, taskEnd: string, scale: number) {
    const startGanttWeek = dayjs(start).startOf('isoWeek');
    const taskStartWeek = dayjs(taskStart).startOf('isoWeek');
    const fromPlanStartWeeks = taskStartWeek.diff(startGanttWeek, 'week');
    const dataX = scale * fromPlanStartWeeks;
    const taskEndWeek = dayjs(taskEnd).startOf('isoWeek');
    const spendWeeks = taskEndWeek.diff(taskStartWeek, 'week') + 1;
    return { dataX, width: spendWeeks * scale, takestime: spendWeeks + t('durationUnit.weeks') };
}

export function calcHourPosition(start: string, taskStart: string, taskEnd: string, scale: number, minuteInterval: number) {
    if (minuteInterval < 60) {
        const fromPlanStartMinutes = dayjs(taskStart).diff(dayjs(start), 'minutes');
        const cellIndex = Math.floor(fromPlanStartMinutes / minuteInterval);
        const dataX = scale * cellIndex;

        const spendMinutes = dayjs(taskEnd).diff(dayjs(taskStart), 'minutes') + minuteInterval;
        const widthCells = Math.ceil(spendMinutes / minuteInterval);
        const width = widthCells * scale;

        const diffHours = Math.floor(spendMinutes / 60);
        const remainMinutes = spendMinutes % 60;
        let takestime = '';
        if (diffHours > 0 && remainMinutes > 0) {
            takestime = t('durationUnit.hoursAndMinutes', { hours: diffHours, minutes: remainMinutes });
        } else if (diffHours > 0) {
            takestime = `${diffHours}${t('durationUnit.hours')}`;
        } else {
            takestime = `${remainMinutes}${t('durationUnit.minutes')}`;
        }
        return { dataX, width, takestime };
    } else {
        const fromPlanStartHours = dayjs(taskStart).diff(dayjs(start), 'hours');
        const dataX = scale * fromPlanStartHours;
        const spendHours = dayjs(taskEnd).diff(dayjs(taskStart), 'hours') + 1;
        return { dataX, width: spendHours * scale, takestime: spendHours + t('durationUnit.hours') };
    }
}
