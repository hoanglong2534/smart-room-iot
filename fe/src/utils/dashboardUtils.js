import iconIncrease from '../assets/icon tăng.png';
import iconDecrease from '../assets/giảm icon.png';

export const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

export const toTimeLabel = (rawTime) => {
    if (!rawTime) return '--:--:--';
    const date = new Date(rawTime);
    if (Number.isNaN(date.getTime())) return '--:--:--';
    return date.toLocaleTimeString('vi-VN', { hour12: false });
};

export const toSensorKey = (name = '') => {
    const normalized = String(name).toLowerCase();
    if (normalized.includes('độ ẩm') || normalized.includes('do am') || normalized.includes('humidity')) return 'humidity';
    if (normalized.includes('ánh sáng') || normalized.includes('anh sang') || normalized.includes('light')) return 'light';
    if (normalized.includes('nhiệt độ') || normalized.includes('nhiet do') || normalized.includes('temperature')) return 'temperature';
    return null;
};

export const getTrend = (series = []) => {
    if (series.length < 2) {
        return { icon: iconIncrease, text: 'Chưa đủ dữ liệu để so sánh' };
    }
    const last = series[series.length - 1].value;
    const prev = series[series.length - 2].value;
    const diff = last - prev;
    let percentageText = '';
    if (prev === 0) {
        percentageText = `${Math.abs(diff).toFixed(1)}°/lx/% so với lần đo trước`;
    } else {
        const percentage = (Math.abs(diff) / prev) * 100;
        percentageText = `${percentage.toFixed(1)}% so với lần đo trước`;
    }
    return { icon: diff >= 0 ? iconIncrease : iconDecrease, text: percentageText };
};

export const applyRecords = (records, setSeriesData, setSnapshot, setLoadingDevices) => {
    if (!records.length) return;
    const MAX_POINTS = 10;

    setSeriesData(prev => {
        const next = {
            humidity: [...prev.humidity],
            light: [...prev.light],
            temperature: [...prev.temperature]
        };

        let latestTime = null;
        let latestHumidity = null, latestLight = null, latestTemperature = null;

        const sortedRecords = [...records].reverse();

        sortedRecords.forEach((record) => {
            const key = toSensorKey(record.name);
            const value = toNumber(record.value);
            const time = record.from || record.time;
            if (!key || value === null) return;

            const timeLabel = toTimeLabel(time);

            if (!next[key].some(item => item.time === timeLabel)) {
                next[key].push({ time: timeLabel, value });
            }
            if (next[key].length > MAX_POINTS) {
                next[key] = next[key].slice(-MAX_POINTS);
            }

            latestTime = time || latestTime;
            if (key === 'humidity') latestHumidity = value;
            if (key === 'light') latestLight = value;
            if (key === 'temperature') latestTemperature = value;
        });

        if (latestHumidity !== null || latestLight !== null || latestTemperature !== null) {
            setSnapshot(prevSnapshot => ({
                humidity: latestHumidity ?? prevSnapshot.humidity,
                light: latestLight ?? prevSnapshot.light,
                temperature: latestTemperature ?? prevSnapshot.temperature,
                time: latestTime || prevSnapshot.time
            }));
        }
        return next;
    });
};
