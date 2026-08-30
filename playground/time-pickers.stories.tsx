import { useState } from 'react'
import { TimePicker } from '../src/components/time-picker/TimePicker'
import { TimeList } from '../src/components/time-list/TimeList'

export const TimePickerStory = () => {
  const [time, setTime] = useState<string | null>('14:30')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 280 }}>
      <TimePicker label="Appointment" value={time} onChange={setTime} />
      <TimePicker label="Unstyled" variant="unstyled" value={null} onChange={setTime} placeholder="Pick…" />
    </div>
  )
}

export const TimeListStory = () => {
  const [times, setTimes] = useState<string[]>(['08:00', '14:30', '21:45'])
  return (
    <div style={{ maxWidth: 480 }}>
      <TimeList
        label="Medication schedule"
        hint="Tap a chip to edit; hover to remove"
        value={times}
        onChange={setTimes}
        maxItems={6}
      />
    </div>
  )
}
