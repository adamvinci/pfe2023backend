declare module '@ioc:Adonis/Core/Validator' {
    interface Rules {
        isNotAdmin(): Rule,
        nurseryAlreadyAssigned(): Rule
    }
}