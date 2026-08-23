import Image from 'next/image'
import { Mail, Phone, Printer, MapPin } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="app-panel mt-8 rounded-2xl px-5 py-6 text-center sm:text-left">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {/* Emblem */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/70 bg-white/70 shadow-inner dark:border-gray-800/70 dark:bg-gray-900/60">
          <Image
            src="/assets/tanzania-emblem.png"
            alt="Alama ya Taifa la Tanzania"
            fill
            sizes="56px"
            className="object-contain object-center p-1.5"
          />
        </div>

        {/* Contact details */}
        <div className="flex-1 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            The United Republic of Tanzania
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            Katibu Mkuu
          </p>
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
            WIZARA YA HABARI, UTAMADUNI, SANAA NA MICHEZO
          </p>

          <div className="flex flex-col gap-1 pt-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              P.O. Box 25, Dodoma, Tanzania &mdash; Mji wa Serikali Mtumba
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              km@michezo.go.tz
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              Telephone: +255 26 2322 129
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Printer className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              Nukushi: +255 26 2322 128
            </span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          © {year} Jamhuri ya Muungano wa Tanzania. Haki zote zimehifadhiwa.
        </p>
      </div>
    </footer>
  )
}
