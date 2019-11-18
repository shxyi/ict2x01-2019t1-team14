import { Injectable } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'

interface user{ /* type struct */
    uid: string
    username: string
    password: string
    email: string
    gender: any
    age: number
    commuteMethod: any
    points: number
    stationConquered: string
}

@Injectable()
export class UserService {
    private user: user

    constructor(
        private afAuth: AngularFireAuth,
    ) {}

    setUser(user: user){
        this.user = user
    }

    getUID() {
        return this.user.uid
    }

    getUsername(): string {
		return this.user.username
    }
    
    updateEmail(username: string) {
		return this.afAuth.auth.currentUser.updateEmail(username + '@firebase.com')
    }

    getPassword(): string {
        return this.user.password
    }

    updatePassword(newpassword: string) {
        return this.afAuth.auth.currentUser.updatePassword(newpassword)
    }

    getEmail(): string {
        return this.user.email
    }
    
    getGender(): any {
        return this.user.gender
    }

    getAge(): number {
        return this.user.age
    }

    getCommuteMethod(): any {
        return this.user.commuteMethod
    }

    getPoints(): number {
        return this.user.points
    }

    getStationConquered(): string {
        return this.user.stationConquered
    }
}