import { useSettings, type CardFace } from '../hooks/useSettings'

const options: { value: CardFace; label: string; flag: string }[] = [
  { value: 'irish', label: 'Irish first', flag: '🇮🇪' },
  { value: 'english', label: 'English first', flag: '🇬🇧' },
]

export default function Settings() {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Settings</h1>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4">
          <p className="font-semibold text-slate-900 mb-0.5">Card language</p>
          <p className="text-sm text-slate-500 mb-4">Which side of the card shows first</p>

          <div className="flex gap-2">
            {options.map(({ value, label, flag }) => (
              <button
                key={value}
                onClick={() => updateSettings({ cardFace: value })}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                  settings.cardFace === value
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span aria-hidden>{flag}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-3 px-1">
        Change takes effect on your next play session.
      </p>
    </div>
  )
}
