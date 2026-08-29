import type { Note } from '~/types/note'

export const MOCK_NOTES: Note[] = [
  {
    id: '1',
    title: 'Список на неделю',
    todos: [
      { id: '1-1', text: 'Купить чернила и бумагу', completed: true },
      { id: '1-2', text: 'Переписать конспект', completed: false },
      { id: '1-3', text: 'Позвонить в деканат', completed: false },
      { id: '1-4', text: 'Скрытый четвёртый пункт не должен торчать в превью', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Очень длинное название заметки без пробелов: НадоПроверитьПереносСтрокиНаУзкомЭкранеИВКарточке',
    todos: [
      { id: '2-1', text: 'Супердлинныйпунктбезпробеловчтобыпроверитьoverflowwrapanywhereвпревьюивредакторе', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Пустой лист',
    todos: [],
  },
]
