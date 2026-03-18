class LabelGenMetrics {
    session;
    startTime;

    constructor() {
        this.session = Date.now() // using time as session id
    }
    startTimer() {
        this.startTime = Date.now()
    }
    stopTimer() {
        // not sure when this'll ever be used... but it's here if we need it.
        return (Date.now() - this.startTime)
    }
    resetTimer() {
        const stopTime = this.stopTimer()
        this.startTime = Date.now()
        return stopTime
    }

    saveLabelMetric() {
        const tbp = this.resetTimer()
        const lbt = getSetting('lbType')
        const prints = this.getMetric('prints')
        prints.push({lbt: lbt, tbp: tbp, t: Date.now(), s: this.session})
        this.setMetric('prints', prints)
    }

    setMetric(metricName, data) {
        this.initMetricsIfNeeded()
        if (this.getMetric('disableMetrics') && (metricName != 'disableMetrics')) {
            console.log('metrics disabled, not setting metric.')
            return;
        }
        const savedData = lsReadJson('metrics')
        if (savedData.hasOwnProperty(metricName)){
            savedData[metricName] = data
            lsStore('metrics', savedData)
        } else {
            throw new Error('invalid metric name. cannot set ' + metricName)
        }
    }

    getMetric(metricName) {
        this.initMetricsIfNeeded()
        const savedData = lsReadJson('metrics')
        if (savedData.hasOwnProperty(metricName)){
            return savedData[metricName]
        } else {
            throw new Error('invalid metric name. cannot get ' + metricName)
        }
    }

    exportMetrics() {
        if (this.getMetric('disableMetrics')){
            throw new Error('metrics disabled. will not export data (the easy way.)')
        } else {
            return btoa(lsRead('metrics')) // simple encode. security through obscurity. I doubt anyone will try to tamper with the metrics.
        }
    }

    initMetricsIfNeeded() {
        if (!lsRead('metrics')){
            lsStore('metrics', {pageLoads: 0, labelsPrinted: 0, disableMetrics: false, prints: []})
        }
    }
}