import { Injectable } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/auth'
import { first } from 'rxjs/operators'
import { auth } from 'firebase/app'
import { AngularFirestore } from '@angular/fire/firestore';

interface user {
	email: string,
	uid: string
}

interface feedback {
	safety: number,
	speed: number,
	enjoyment: number,
	routeID: string
}

@Injectable()
export class UserService {
	private user: user
	private feedback: feedback

	constructor(
		private afAuth: AngularFireAuth,
		private firestore: AngularFirestore
	) {}

	setUser(user: user) {
		this.user = user
	}

	setFeedback(feedback) {
		return this.firestore.collection('feedback').add(feedback);
	}

	getEmail(): string {
		return this.user.email
	}

	reAuth(email: string, password: string) {
		return this.afAuth.auth.currentUser.reauthenticateWithCredential(auth.EmailAuthProvider.credential(email, password))
	}

	updatePassword(newpassword: string) {
		return this.afAuth.auth.currentUser.updatePassword(newpassword)
	}

	updateEmail(newemail: string) {
		return this.afAuth.auth.currentUser.updateEmail(newemail)
	}

	async isAuthenticated() {
		if(this.user) return true

		const user = await this.afAuth.authState.pipe(first()).toPromise()

		if(user) {
			this.setUser({
				email: user.email,
				uid: user.uid
			})

			return true
		}
		return false
	}

	getUID(): string {
		return this.user.uid
	}
}
