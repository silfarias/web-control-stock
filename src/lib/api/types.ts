export type PageMetadata = {
  count: number
  pageSize: number
  pageNumber: number
  totalPages: number
  sortBy: string
}

export type PageDto<T> = {
  data: T[]
  metadata: PageMetadata
}

export type SearchParams = {
  q?: string
  pageNumber?: number
  pageSize?: number
  orderBy?: string
  orderDirection?: 'ASC' | 'DESC'
}
