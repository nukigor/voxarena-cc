'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import {
  HomeIcon,
  TagIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

type NavigationItem = {
  name: string
  href?: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  current?: boolean
  children?: Array<{ name: string; href: string; current?: boolean }>
}

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    {
      name: 'Taxonomy',
      icon: TagIcon,
      children: [
        { name: 'Categories', href: '/admin/taxonomy-categories' },
        { name: 'Terms', href: '/admin/taxonomy-terms' },
      ],
    },
    { name: 'Personas', href: '/admin/personas', icon: UserGroupIcon },
    {
      name: 'Debates',
      icon: ChatBubbleLeftRightIcon,
      children: [
        { name: 'All Debates', href: '/admin/debates' },
        { name: 'Formats', href: '/admin/format-templates' },
        { name: 'Modes', href: '/admin/debate-modes' },
      ],
    },
    { name: 'AI Prompts', href: '/admin/ai-prompts', icon: SparklesIcon },
  ]

  // Check if current path matches
  const isCurrentPath = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  // Check if any child is current
  const hasCurrentChild = (item: NavigationItem) => {
    return item.children?.some(child => isCurrentPath(child.href)) || false
  }

  // Update open sections based on pathname
  useEffect(() => {
    const newOpenSections: Record<string, boolean> = {}
    navigation.forEach((item) => {
      if (item.children) {
        newOpenSections[item.name] = hasCurrentChild(item)
      }
    })
    setOpenSections(newOpenSections)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="relative flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 dark:border-white/10 dark:bg-gray-900 dark:before:pointer-events-none dark:before:absolute dark:before:inset-0 dark:before:bg-black/10">
          <div className="relative flex h-16 shrink-0 items-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">VoxArena</span>
          </div>
          <nav className="relative flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      {!item.children ? (
                        <Link
                          href={item.href!}
                          className={classNames(
                            isCurrentPath(item.href!)
                              ? 'bg-gray-50 dark:bg-white/5 dark:text-white'
                              : 'hover:bg-gray-50 dark:hover:bg-white/5 dark:hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 dark:text-gray-400',
                          )}
                        >
                          <item.icon aria-hidden="true" className="size-6 shrink-0 text-gray-400 dark:text-current" />
                          {item.name}
                        </Link>
                      ) : (
                        <Disclosure
                          as="div"
                          open={openSections[item.name]}
                          onChange={(open) => setOpenSections(prev => ({ ...prev, [item.name]: open }))}
                        >
                          <DisclosureButton
                            className={classNames(
                              hasCurrentChild(item)
                                ? 'bg-gray-50 dark:bg-white/5 dark:text-white'
                                : 'hover:bg-gray-50 dark:hover:bg-white/5 dark:hover:text-white',
                              'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-semibold text-gray-700 dark:text-gray-400',
                            )}
                          >
                            <item.icon aria-hidden="true" className="size-6 shrink-0 text-gray-400 dark:text-current" />
                            {item.name}
                            <ChevronRightIcon
                              aria-hidden="true"
                              className="ml-auto size-5 shrink-0 text-gray-400 group-data-[open]:rotate-90 group-data-[open]:text-gray-500 dark:group-data-[open]:text-gray-400 transition-transform duration-200"
                            />
                          </DisclosureButton>
                          <DisclosurePanel as="ul" className="mt-1 px-2">
                            {item.children.map((subItem) => (
                              <li key={subItem.name}>
                                <Link
                                  href={subItem.href}
                                  className={classNames(
                                    isCurrentPath(subItem.href)
                                      ? 'bg-gray-50 dark:bg-white/5 dark:text-white'
                                      : 'hover:bg-gray-50 dark:hover:bg-white/5 dark:hover:text-white',
                                    'block rounded-md py-2 pr-2 pl-9 text-sm/6 text-gray-700 dark:text-gray-400',
                                  )}
                                >
                                  {subItem.name}
                                </Link>
                              </li>
                            ))}
                          </DisclosurePanel>
                        </Disclosure>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
              <li className="-mx-6 mt-auto">
                <a
                  href="#"
                  className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
                >
                  <div className="size-8 rounded-full bg-gray-200 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">A</span>
                  </div>
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">Admin</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
