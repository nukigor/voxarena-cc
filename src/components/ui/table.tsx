import { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
}

export function Table({ children }: TableProps) {
  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 sm:rounded-lg dark:shadow-none dark:ring-white/10">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-white/15">
              {children}
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TableHeaderProps {
  children: ReactNode
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50 dark:bg-gray-800/75">
      <tr>{children}</tr>
    </thead>
  )
}

interface TableBodyProps {
  children: ReactNode
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody className="divide-y divide-gray-200 bg-white dark:divide-white/10 dark:bg-gray-800/50">
      {children}
    </tbody>
  )
}

interface TableRowProps {
  children: ReactNode
}

export function TableRow({ children }: TableRowProps) {
  return <tr>{children}</tr>
}

interface TableHeadProps {
  children: ReactNode
  className?: string
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <th
      scope="col"
      className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 ${className}`}
    >
      {children}
    </th>
  )
}

interface TableCellProps {
  children: ReactNode
  className?: string
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-3 py-4 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </td>
  )
}