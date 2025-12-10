import { computed } from 'vue'

interface SearchBarProps {
  modelValue: string
}

interface SearchBarEmit {
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
}

export function useSearchBar(props: SearchBarProps, emit: SearchBarEmit) {
  const normalizedValue = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value),
  })

  const handleSubmit = () => {
    emit('submit')
  }

  return {
    normalizedValue,
    handleSubmit,
  }
}
