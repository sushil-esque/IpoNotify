 export interface IPOS {
    name: string
    issueManager: string
    issuedUnit: string
    openDate: Date
    closeDate: Date
    status: "open" | "closed" | "upcoming"
}