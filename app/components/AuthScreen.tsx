import DateTimePicker from '@react-native-community/datetimepicker';
import { decode as atob } from 'base-64';
import React, { useState } from 'react';
import {
	Button,
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

const COGNITO_CONFIG = {
	ClientId: '2mig4lgdth8ebo96llg2scil6',
	UserPoolId: 'eu-central-1_0Sn70cSKu',
};

export default function AuthScreen() {
	const [isLogin, setIsLogin] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [idToken, setIdToken] = useState<string | null>(null);
	const [jwtPayload, setJwtPayload] = useState<any>(null);
	const [apiResponse, setApiResponse] = useState<string | null>(null);

	// Login state
	const [loginEmail, setLoginEmail] = useState('');
	const [loginPassword, setLoginPassword] = useState('');

	// Signup state
	const [signupEmail, setSignupEmail] = useState('');
	const [signupPassword, setSignupPassword] = useState('');
	const [givenName, setGivenName] = useState('');
	const [familyName, setFamilyName] = useState('');
	const [gender, setGender] = useState('');
	const [birthdate, setBirthdate] = useState('');
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [genderModalVisible, setGenderModalVisible] = useState(false);

	function decodeJwt(token: string) {
		try {
			const payload = token.split('.')[1];
			const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
			return JSON.parse(decoded);
		} catch {
			return null;
		}
	}

	async function handleSignup() {
		try {
			const userAttributes = [
				{ Name: 'email', Value: signupEmail },
				{ Name: 'given_name', Value: givenName },
				{ Name: 'family_name', Value: familyName },
			];
			if (gender) userAttributes.push({ Name: 'gender', Value: gender });
			if (birthdate)
				userAttributes.push({ Name: 'birthdate', Value: birthdate });

			const params = {
				ClientId: COGNITO_CONFIG.ClientId,
				Username: signupEmail,
				Password: signupPassword,
				UserAttributes: userAttributes,
			};

			const response = await fetch(
				'https://cognito-idp.eu-central-1.amazonaws.com/',
				{
					method: 'POST',
					headers: {
						'X-Amz-Target': 'AWSCognitoIdentityProviderService.SignUp',
						'Content-Type': 'application/x-amz-json-1.1',
					},
					body: JSON.stringify(params),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				alert(data.message || 'Signup failed');
				return;
			}

			if (data.UserConfirmed === false) {
				alert(
					'Successfully signed up! Please check your email for a verification code.'
				);
				// Optionally, show a verification input here
			} else {
				alert('Successfully signed up! You can now login.');
				setIsLogin(true);
			}
		} catch (error) {
			let message = 'An error occurred';
			if (error && typeof error === 'object' && 'message' in error) {
				message = (error as { message: string }).message;
			}
			alert('Signup error: ' + message);
		}
	}

	async function handleLogin() {
		try {
			const params = {
				AuthFlow: 'USER_PASSWORD_AUTH',
				ClientId: COGNITO_CONFIG.ClientId,
				AuthParameters: {
					USERNAME: loginEmail,
					PASSWORD: loginPassword,
				},
			};

			const response = await fetch(
				'https://cognito-idp.eu-central-1.amazonaws.com/',
				{
					method: 'POST',
					headers: {
						'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
						'Content-Type': 'application/x-amz-json-1.1',
					},
					body: JSON.stringify(params),
				}
			);

			const data = await response.json();

			if (data.AuthenticationResult) {
				const { IdToken } = data.AuthenticationResult;
				setIdToken(IdToken);
				setJwtPayload(decodeJwt(IdToken));
				setIsAuthenticated(true);
			} else {
				alert(data.message || 'Authentication failed');
			}
		} catch (error) {
			let message = 'An error occurred';
			if (error && typeof error === 'object' && 'message' in error) {
				message = (error as { message: string }).message;
			}
			alert('Login error: ' + message);
		}
	}

	async function testMatchEndpoint() {
		try {
			const apiUrl =
				'https://c0su3lk7ae.execute-api.eu-central-1.amazonaws.com/dev/match';
			if (!idToken) throw new Error('No authentication token found');
			if (!jwtPayload) throw new Error('No user info found');

			// Use Cognito's "sub" as userId, or fallback to "username"
			const userId = jwtPayload.sub || jwtPayload.username || 'unknown-user';

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${idToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user_id: userId, // <-- use snake_case
					matchCriteria: {
						ageRange: { min: 25, max: 35 },
						gender: 'female',
					},
				}),
			});
			const data = await response.json();
			setApiResponse(JSON.stringify(data, null, 2));
		} catch (error) {
			setApiResponse('Error: ' + (error as any).message);
		}
	}

	function logout() {
		setIsAuthenticated(false);
		setIdToken(null);
		setJwtPayload(null);
		setApiResponse(null);
		setLoginEmail('');
		setLoginPassword('');
	}

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={60}
		>
			<ScrollView
				contentContainerStyle={styles.container}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.tabContainer}>
					<TouchableOpacity
						style={[styles.tab, isLogin && styles.activeTab]}
						onPress={() => setIsLogin(true)}
					>
						<Text style={isLogin ? styles.activeTabText : styles.tabText}>
							Login
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.tab, !isLogin && styles.activeTab]}
						onPress={() => setIsLogin(false)}
					>
						<Text style={!isLogin ? styles.activeTabText : styles.tabText}>
							Sign Up
						</Text>
					</TouchableOpacity>
				</View>
				{isAuthenticated ? (
					<View style={styles.profileContainer}>
						<Text style={styles.profileTitle}>Logged in successfully!</Text>
						<ScrollView
							style={styles.profileScroll}
							contentContainerStyle={{ padding: 10 }}
						>
							<Text style={styles.profileSubtitle}>User Attributes:</Text>
							{jwtPayload &&
								Object.entries(jwtPayload).map(([key, value]) => (
									<View key={key} style={styles.attributeRow}>
										<Text style={styles.attributeKey}>{key}:</Text>
										<Text style={styles.attributeValue}>{String(value)}</Text>
									</View>
								))}
							<Text style={styles.profileSubtitle}>Raw Token Data:</Text>
							<Text style={styles.tokenData}>
								{JSON.stringify(jwtPayload, null, 2)}
							</Text>
							<Button
								title="Test /match Endpoint"
								onPress={testMatchEndpoint}
							/>
							{apiResponse && (
								<View style={styles.apiResponseBox}>
									<Text style={styles.profileSubtitle}>
										Match API Response:
									</Text>
									<Text style={styles.tokenData}>{apiResponse}</Text>
								</View>
							)}
							<Button title="Logout" color="#d9534f" onPress={logout} />
						</ScrollView>
					</View>
				) : isLogin ? (
					<View>
						<Text style={styles.label}>Email</Text>
						<TextInput
							placeholder="Enter your email"
							style={styles.input}
							autoCapitalize="none"
							value={loginEmail}
							onChangeText={setLoginEmail}
							keyboardType="email-address"
						/>
						<Text style={styles.label}>Password</Text>
						<TextInput
							placeholder="Enter your password"
							style={styles.input}
							secureTextEntry
							value={loginPassword}
							onChangeText={setLoginPassword}
						/>
						<Button title="Login" onPress={handleLogin} />
					</View>
				) : (
					<View>
						<Text style={styles.label}>Email</Text>
						<TextInput
							placeholder="Enter your email"
							style={styles.input}
							autoCapitalize="none"
							value={signupEmail}
							onChangeText={setSignupEmail}
							keyboardType="email-address"
						/>
						<Text style={styles.label}>Password</Text>
						<TextInput
							placeholder="Enter your password"
							style={styles.input}
							secureTextEntry
							value={signupPassword}
							onChangeText={setSignupPassword}
						/>
						<Text style={styles.label}>First Name</Text>
						<TextInput
							placeholder="Enter your first name"
							style={styles.input}
							value={givenName}
							onChangeText={setGivenName}
						/>
						<Text style={styles.label}>Last Name</Text>
						<TextInput
							placeholder="Enter your last name"
							style={styles.input}
							value={familyName}
							onChangeText={setFamilyName}
						/>
						<Text style={styles.label}>Gender (optional)</Text>
						<TouchableOpacity
							style={styles.input}
							onPress={() => setGenderModalVisible(true)}
						>
							<Text style={{ color: gender ? '#333' : '#888' }}>
								{gender
									? gender.charAt(0).toUpperCase() + gender.slice(1)
									: 'Select Gender (Optional)'}
							</Text>
						</TouchableOpacity>
						<Modal
							visible={genderModalVisible}
							transparent
							animationType="slide"
							onRequestClose={() => setGenderModalVisible(false)}
						>
							<View style={styles.modalOverlay}>
								<View style={styles.modalContent}>
									<Text style={styles.label}>Select Gender</Text>
									{['male', 'female', 'other'].map((option) => (
										<TouchableOpacity
											key={option}
											style={styles.modalOption}
											onPress={() => {
												setGender(option);
												setGenderModalVisible(false);
											}}
										>
											<Text style={styles.modalOptionText}>
												{option.charAt(0).toUpperCase() + option.slice(1)}
											</Text>
										</TouchableOpacity>
									))}
									<TouchableOpacity
										style={styles.modalOption}
										onPress={() => {
											setGender('');
											setGenderModalVisible(false);
										}}
									>
										<Text style={[styles.modalOptionText, { color: '#888' }]}>
											Cancel
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						</Modal>
						<Text style={styles.label}>Birthdate (optional)</Text>
						<TouchableOpacity
							style={styles.input}
							onPress={() => setShowDatePicker(true)}
							activeOpacity={0.7}
						>
							<Text style={{ color: birthdate ? '#333' : '#888' }}>
								{birthdate ? birthdate : 'Select your birthdate (Optional)'}
							</Text>
						</TouchableOpacity>
						{showDatePicker && (
							<DateTimePicker
								value={birthdate ? new Date(birthdate) : new Date(2000, 0, 1)}
								mode="date"
								display="default"
								maximumDate={new Date(2025, 11, 31)}
								minimumDate={new Date(1900, 0, 1)}
								onChange={(_, selectedDate) => {
									setShowDatePicker(false);
									if (selectedDate) {
										const iso = selectedDate.toISOString().split('T')[0];
										setBirthdate(iso);
									}
								}}
							/>
						)}
						<Button title="Sign Up" onPress={handleSignup} />
					</View>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	tabContainer: { flexDirection: 'row', marginBottom: 20 },
	tab: {
		padding: 10,
		marginHorizontal: 5,
		borderRadius: 5,
		backgroundColor: '#f0f0f0',
	},
	activeTab: { backgroundColor: '#007bff' },
	tabText: { color: '#333' },
	activeTabText: { color: '#fff' },
	label: {
		alignSelf: 'flex-start',
		marginLeft: 5,
		marginTop: 10,
		marginBottom: 2,
		fontWeight: 'bold',
		color: '#333',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 5,
		padding: 10,
		marginBottom: 5,
		width: 250,
	},
	pickerWrapper: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 5,
		marginBottom: 5,
		width: 250,
	},
	picker: {
		width: 250,
		height: 44,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.3)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 20,
		width: 250,
		alignItems: 'center',
	},
	modalOption: {
		paddingVertical: 12,
		width: '100%',
		alignItems: 'center',
	},
	modalOptionText: {
		fontSize: 16,
		color: '#007bff',
	},
	profileContainer: {
		flex: 1,
		padding: 20,
		backgroundColor: '#f5f5f5',
	},
	profileTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	profileSubtitle: {
		fontWeight: 'bold',
		marginTop: 10,
		marginBottom: 5,
	},
	profileScroll: {
		maxHeight: 400,
	},
	attributeRow: {
		flexDirection: 'row',
		marginBottom: 4,
	},
	attributeKey: {
		fontWeight: 'bold',
		marginRight: 5,
	},
	attributeValue: {
		color: '#333',
	},
	tokenData: {
		backgroundColor: '#fff',
		padding: 10,
		borderRadius: 4,
		fontFamily: 'monospace',
		marginBottom: 10,
	},
	apiResponseBox: {
		backgroundColor: '#fff',
		padding: 10,
		borderRadius: 4,
		marginTop: 10,
	},
});
