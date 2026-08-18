import Image from 'next/image'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="app-panel mt-8 flex flex-col items-center gap-3 rounded-2xl px-5 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
      <div className="flex items-center gap-3">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/70 bg-white/70 shadow-inner dark:border-gray-800/70 dark:bg-gray-900/60">
          <Image
            src="/assets/tanzania-emblem.png"
            alt="Alama ya Taifa la Tanzania"
            fill
            sizes="36px"
            className="object-contain object-center p-1"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Wizara ya Habari, Utamaduni, Sanaa na Michezo
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Mfumo wa Kibali cha Kuchukua Mafuta
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        © {year} Jamhuri ya Muungano wa Tanzania. Haki zote zimehifadhiwa.
      </p>
    </footer>
  )
}
