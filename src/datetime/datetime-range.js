import CalendarRange from '../calendar/calendar-range';
import TimeRange from '../time/time-range';
import { pick } from '../util/base';
import { isValidRangeDate, assignTime } from '../util/date';

export default {
  name: 'DatetimeRange',
  props: {
    ...CalendarRange.props,
    ...TimeRange.props,
    showTimePanel: {
      type: Boolean,
      default: undefined,
    },
  },
  data() {
    return {
      defaultTimeVisible: false,
      currentValue: this.value,
    };
  },
  computed: {
    timeVisible() {
      return typeof this.showTimePanel === 'boolean' ? this.showTimePanel : this.defaultTimeVisible;
    },
  },
  watch: {
    value(val) {
      this.currentValue = val;
    },
  },
  methods: {
    closeTimePanel() {
      this.defaultTimeVisible = false;
    },
    openTimePanel() {
      this.defaultTimeVisible = true;
    },
    emitDate(dates, type) {
      this.$emit('select', dates, type);
    },
    handleSelect(dates, type) {
      if (type === 'date') {
        this.openTimePanel();
      }
      let datetimes = dates.map((date, i) => {
        const time = isValidRangeDate(this.value) ? this.value[i] : this.defaultValue;
        return assignTime(date, time);
      });
      if (datetimes[1].getTime() < datetimes[0].getTime()) {
        datetimes = [datetimes[0], datetimes[0]];
      }
      if (datetimes.some(this.disabledTime)) {
        datetimes = dates.map(date => assignTime(date, this.defaultValue));
        if (datetimes.some(this.disabledTime)) {
          this.currentValue = datetimes;
          return;
        }
      }
      this.emitDate(datetimes, type);
    },
  },
  render() {
    const calendarProps = {
      props: {
        ...pick(this, Object.keys(CalendarRange.props)),
        type: 'date',
        value: this.currentValue,
      },
      on: {
        select: this.handleSelect,
      },
    };
    const timeProps = {
      props: {
        ...pick(this, Object.keys(TimeRange.props)),
        value: this.currentValue,
        showTimeHeader: true,
      },
      on: {
        select: this.emitDate,
        'title-click': this.closeTimePanel,
      },
    };
    return (
      <div>
        <CalendarRange {...calendarProps} />
        {this.timeVisible && <TimeRange class="mx-calendar-time" {...timeProps} />}
      </div>
    );
  },
};
