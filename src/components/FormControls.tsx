import type { ChangeEvent, PropsWithChildren } from 'react'

export function ControlGroup({ title, children }: PropsWithChildren<{ title: string }>) {
  return <fieldset className="control-group"><legend>{title}</legend>{children}</fieldset>
}

export function SelectRow({ label, value, options, onChange, disabled = false }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className={`control-row ${disabled ? 'is-disabled' : ''}`}><span>{label}</span><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
}

export function TextRow({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="control-row"><span>{label}</span><input value={value} placeholder={placeholder} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)} /></label>
}

export function CheckRow({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return <label className={`check-row ${disabled ? 'is-disabled' : ''}`}><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>
}
