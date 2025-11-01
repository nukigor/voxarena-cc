'use client'

import React from 'react'
import { FieldConfig } from '@/types/persona-form-config'
import { UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form'
import { ChevronDownIcon, ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { InformationCircleIcon, XMarkIcon, CheckIcon } from '@heroicons/react/20/solid'
import { Popover, PopoverButton, PopoverPanel, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'

interface DynamicFieldProps {
  field: FieldConfig
  register: UseFormRegister<any>
  errors: FieldErrors
  value?: any
  onChange?: (value: any) => void
  avatarPreview?: string // For avatar field
  control?: Control<any> // For controlled components like multi-select
}

export function DynamicField({
  field,
  register,
  errors,
  value,
  onChange,
  avatarPreview,
  control,
}: DynamicFieldProps) {
  const error = errors[field.name]
  const fieldId = `field-${field.name}`

  // Build validation rules
  const validationRules: any = {
    required: field.mandatory ? `${field.label} is required` : false,
  }

  if (field.validation) {
    if (field.validation.minLength) {
      validationRules.minLength = {
        value: field.validation.minLength,
        message: `Minimum ${field.validation.minLength} characters`,
      }
    }
    if (field.validation.maxLength) {
      validationRules.maxLength = {
        value: field.validation.maxLength,
        message: `Maximum ${field.validation.maxLength} characters`,
      }
    }
    if (field.validation.min !== undefined) {
      validationRules.min = {
        value: field.validation.min,
        message: `Minimum value is ${field.validation.min}`,
      }
    }
    if (field.validation.max !== undefined) {
      validationRules.max = {
        value: field.validation.max,
        message: `Maximum value is ${field.validation.max}`,
      }
    }
    if (field.validation.pattern) {
      validationRules.pattern = {
        value: new RegExp(field.validation.pattern),
        message: 'Invalid format',
      }
    }
  }

  const baseInputClasses =
    'block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:placeholder:text-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500'

  return (
    <div className="sm:col-span-6">
      <label
        htmlFor={fieldId}
        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
      >
        {field.label}
        {field.mandatory && (
          <span className="text-red-600 dark:text-red-400"> *</span>
        )}
      </label>


      <div className="mt-2">
        {field.type === 'text' && (
          <input
            {...register(field.name, validationRules)}
            id={fieldId}
            type="text"
            className={baseInputClasses}
          />
        )}

        {field.type === 'textarea' && (
          <textarea
            {...register(field.name, validationRules)}
            id={fieldId}
            rows={4}
            className={baseInputClasses}
          />
        )}

        {field.type === 'single_select' && (
          <div className="grid grid-cols-1">
            <select
              {...register(field.name, validationRules)}
              id={fieldId}
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:border-white/10 dark:*:bg-gray-800 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
            />
          </div>
        )}

        {field.type === 'multi_select' && control && (
          <Controller
            name={field.name}
            control={control}
            rules={validationRules}
            render={({ field: { value: fieldValue = [], onChange: fieldOnChange } }) => {
              const [searchQuery, setSearchQuery] = React.useState('')

              const filteredOptions = field.options?.filter((option) =>
                option.label.toLowerCase().includes(searchQuery.toLowerCase())
              ) || []

              return (
                <div>
                  <Listbox
                    value={fieldValue}
                    onChange={fieldOnChange}
                    multiple
                  >
                    {({ open }) => (
                      <div className="relative">
                        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 shadow-xs outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus-visible:outline-indigo-500 inset-ring inset-ring-gray-300 dark:inset-ring-white/10">
                          <span className="col-start-1 row-start-1 truncate pr-6">
                            {fieldValue && fieldValue.length > 0 ? (
                              <span className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-400">
                                {fieldValue.length} selected
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    fieldOnChange([])
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      fieldOnChange([])
                                    }
                                  }}
                                  className="group relative -mr-1 size-3.5 rounded-xs hover:bg-indigo-600/20 dark:hover:bg-indigo-400/20 cursor-pointer"
                                >
                                  <span className="sr-only">Clear all</span>
                                  <svg
                                    viewBox="0 0 14 14"
                                    className="size-3.5 stroke-indigo-700/50 group-hover:stroke-indigo-700/75 dark:stroke-indigo-400 dark:group-hover:stroke-indigo-300"
                                  >
                                    <path d="M4 4l6 6m0-6l-6 6" />
                                  </svg>
                                  <span className="absolute -inset-1" />
                                </span>
                              </span>
                            ) : (
                              'Select options'
                            )}
                          </span>
                          <ChevronUpDownIcon
                            aria-hidden="true"
                            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400"
                          />
                        </ListboxButton>

                        <ListboxOptions
                          transition
                          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                        >
                          {open && (
                            <div className="sticky top-0 z-10 bg-white px-2 py-2 dark:bg-gray-800">
                              <input
                                type="text"
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  e.stopPropagation()
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                  }
                                }}
                              />
                            </div>
                          )}
                          {filteredOptions.length === 0 ? (
                            <div className="py-2 px-3 text-sm text-gray-500 dark:text-gray-400">
                              No options found
                            </div>
                          ) : (
                            filteredOptions.map((option) => (
                              <ListboxOption
                                key={option.value}
                                value={option.value}
                                className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white hover:bg-indigo-600 hover:text-white dark:text-white dark:data-focus:bg-indigo-500 dark:hover:bg-indigo-500"
                              >
                                {({ selected, focus }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                      {option.label}
                                    </span>

                                    {selected && (
                                      <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${focus ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                        <CheckIcon aria-hidden="true" className="size-5" />
                                      </span>
                                    )}
                                  </>
                                )}
                              </ListboxOption>
                            ))
                          )}
                        </ListboxOptions>
                      </div>
                    )}
                  </Listbox>

                  {/* Selected badges */}
                  {fieldValue && fieldValue.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {fieldValue.map((selectedValue: string) => {
                        const option = field.options?.find((opt) => opt.value === selectedValue)
                        if (!option) return null

                        return (
                          <span
                            key={selectedValue}
                            className="inline-flex items-center gap-x-0.5 rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-400"
                          >
                            {option.label}
                            <button
                              type="button"
                              onClick={() => {
                                const newValue = fieldValue.filter((v: string) => v !== selectedValue)
                                fieldOnChange(newValue)
                              }}
                              className="group relative -mr-1 size-3.5 rounded-xs hover:bg-indigo-600/20 dark:hover:bg-indigo-400/20"
                            >
                              <span className="sr-only">Remove {option.label}</span>
                              <svg
                                viewBox="0 0 14 14"
                                className="size-3.5 stroke-indigo-700/50 group-hover:stroke-indigo-700/75 dark:stroke-indigo-400 dark:group-hover:stroke-indigo-300"
                              >
                                <path d="M4 4l6 6m0-6l-6 6" />
                              </svg>
                              <span className="absolute -inset-1" />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }}
          />
        )}

        {field.type === 'slider' && field.options && control && (
          <Controller
            name={field.name}
            control={control}
            rules={validationRules}
            render={({ field: { value: fieldValue, onChange: fieldOnChange } }) => {
              // Sort options by their original order (they should already be sorted by sortOrder from the API)
              const sortedOptions = [...field.options]

              // Find the index of the currently selected value
              const currentIndex = fieldValue
                ? sortedOptions.findIndex(opt => opt.value === fieldValue)
                : -1

              // Find the selected option to display its name
              const selectedOption = currentIndex >= 0 ? sortedOptions[currentIndex] : null

              return (
                <div>
                  <input
                    type="range"
                    id={fieldId}
                    min={0}
                    max={sortedOptions.length - 1}
                    step={1}
                    value={currentIndex >= 0 ? currentIndex : 0}
                    onChange={(e) => {
                      const index = parseInt(e.target.value)
                      fieldOnChange(sortedOptions[index].value)
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600 dark:accent-indigo-500"
                  />
                  <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <span>{sortedOptions[0]?.label}</span>
                    <span className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-400">
                      {selectedOption?.label || sortedOptions[0]?.label}
                    </span>
                    <span>{sortedOptions[sortedOptions.length - 1]?.label}</span>
                  </div>
                </div>
              )
            }}
          />
        )}

        {field.type === 'avatar' && (
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {avatarPreview && avatarPreview.startsWith('http') ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="size-full object-cover"
                />
              ) : avatarPreview ? (
                <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                  {avatarPreview}
                </span>
              ) : (
                <svg
                  className="size-12 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Avatar Preview
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avatar will be AI-generated after saving
              </p>
            </div>
          </div>
        )}
      </div>

      {field.helperText && !error && (
        <div className="mt-2 flex items-center gap-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {field.helperText}
          </p>
          {field.description && (
            <Popover className="relative">
              {({ close }) => (
                <>
                  <PopoverButton className="inline-flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                    <InformationCircleIcon className="size-4" />
                    <span className="sr-only">More information about {field.label}</span>
                  </PopoverButton>

                  <PopoverPanel
                    transition
                    className="fixed left-1/2 top-1/2 z-50 flex w-screen max-w-max -translate-x-1/2 -translate-y-1/2 bg-transparent px-4 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                  >
                    <div className="w-screen max-w-sm flex-auto overflow-hidden rounded-3xl bg-white text-sm/6 shadow-2xl outline-1 outline-gray-900/5 dark:bg-gray-800 dark:shadow-2xl dark:-outline-offset-1 dark:outline-white/10">
                      <div className="relative p-4">
                        <button
                          type="button"
                          onClick={() => close()}
                          className="absolute right-4 top-4 z-10 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 focus:outline-none dark:text-gray-500 dark:hover:text-gray-300"
                        >
                          <span className="sr-only">Close</span>
                          <XMarkIcon className="size-6" />
                        </button>

                        <div className="group relative rounded-lg p-4 pr-12">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {field.label}
                            </p>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                              {field.description}
                            </p>
                          </div>
                        </div>

                    {/* For taxonomy fields, show available terms */}
                    {field.source === 'persona_taxonomy' && field.options && field.options.length > 0 && (
                      <div className="mt-4 border-t border-gray-100 pt-4 dark:border-white/10">
                        <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                          Available Options:
                        </p>
                        <div className="mt-2 max-h-60 overflow-y-auto">
                          {field.options.map((option) => (
                            <div
                              key={option.value}
                              className="rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                              <p className="font-medium text-gray-900 dark:text-white">
                                {option.label}
                              </p>
                              {option.description && (
                                <p className="mt-1 text-gray-600 dark:text-gray-400">
                                  {option.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                      </div>
                    </div>
                  </PopoverPanel>
                </>
              )}
            </Popover>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error.message as string}
        </p>
      )}
    </div>
  )
}
