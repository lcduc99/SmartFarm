import React, {Component} from 'react';
import {
  StyleSheet,
  ImageBackground,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Container,
  Content,
  Input,
  Icon,
  Button,
  InputGroup,
  Text,
} from 'native-base';

import Spinner from 'react-native-loading-spinner-overlay';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-simple-toast';

//import Home from './home.js';
import logo from '../images/logo.jpg';
//import logo from '../images/logo.png';
import bg from '../images/bg.jpg';
import websocket from './websocket.js';
import Loading from './Loading.js';

import Alarm from './alarm';
import Alarms from './alarm';

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showPass: true,
      press: false,

      username: '',
      password: '',

      // username: 'admin01',
      // password: '12345',

      spinner: false,
    };
    NetInfo.fetch().then(state => {
      // console.log('Connection type', state.type);
      // console.log('Is connected?', state.isConnected);

      if (!state.isConnected) {
        Toast.show(
          'Vui lòng kiểm tra lại internet để tiếp tục sử dụng.',
          Toast.LONG,
        );
      }
    });
  }

  showPass = () => {
    if (this.state.press == false) {
      this.setState({showPass: false, press: true});
    } else {
      this.setState({showPass: true, press: false});
    }
  };

  login = () => {
    try {
      NetInfo.fetch().then(state => {
        // console.log('Connection type', state.type);
        // console.log('Is connected?', state.isConnected);

        if (!state.isConnected) {
          Toast.show(
            'Vui lòng kiểm tra lại internet để tiếp tục sử dụng.',
            Toast.LONG,
          );
        } else {
          if (this.state.password == '' || this.state.username == '') {
            Alert.alert(
              'Thông báo',
              'Vui lòng nhập đầy đủ tài khoản và mật khẩu',
              [
                {
                  text: 'Đồng ý',
                  onPress: () => null,
                  style: 'cancel',
                },
              ],
            );
          } else {
            this.setState({spinner: !this.state.spinner});

            var actionLogin = {
              action: 'login',
              data: {
                username: this.state.username,
                password: this.state.password,
              },
            };
            websocket.send(JSON.stringify(actionLogin));
          }
        }
      });
    } catch (error) {
      console.log(error);
      this.setState({spinner: false});
    }
  };

  AlertFailSetupDevice = () => {
    Alert.alert(
      'Thêm thiết bị thất bại',
      'Vui lòng kết nối wifi với thiết bị để tiếp tục',
      [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Setup Device',
          onPress: () => this.props.navigation.navigate('SetUpDevice'),
        },
      ],
    );
    return true;
  };

  componentWillUnmount() {
    if (this.unReceive) {
      this.unReceive();
    }
  }
  componentDidMount() {
    try {
      this.unReceive = websocket.receive(e => {
        // console.log(e);

        const data = JSON.parse(e.data);
        if (data.action == undefined) {
          this.setState({spinner: false});
        }
        //console.log(data);
        if (data.action == 'DeviceSendDataServer') {
          if (data.message == 'addDataDeviceSuccess') {
            console.log('Thêm thành công thiết bị');
            this.setState({spinner: !this.state.spinner});
          } else {
            console.log('Thêm thiết bị thất bại');
            this.setState({spinner: !this.state.spinner});
            this.AlertFailSetupDevice;
          }
        } else if (data.action === 'login') {
          if (data.message === 'Login success') {
            //console.log('LOGIN success:  ',data.data.nameDevice);
            //this.setState({nameDevice: data.data.nameDevice});
            this.setState({spinner: !this.state.spinner});

            this.props.navigation.navigate('Home', {
              name: data.data.name,
              username: data.data.username,
              pass: this.state.password,
              nameDevice: data.data.nameDevice,
            });
          } else {
            this.setState({spinner: !this.state.spinner});
            // eslint-disable-next-line no-alert
            Alert.alert(
              'Thông báo',
              'Vui lòng kiểm tra lại tài khoản và mật khẩu',
              [
                {
                  text: 'OK',
                  onPress: () => null,
                  style: 'cancel',
                },
              ],
            );
          }
        }
      });
    } catch (error) {
      console.log(error);
      this.setState({spinner: false});
      Alert.alert('Thông báo', 'Vui lòng kiểm tra lại internet', [
        {
          text: 'OK',
          onPress: () => null,
          style: 'cancel',
        },
      ]);
    }
  }

  render() {
    const {username, password} = this.state;
    return (
      <Container>
        {/* <Loading></Loading> */}
        <Spinner visible={this.state.spinner} textContent={'Loading...'} />
        {/* <Alarms /> */}

        <ImageBackground source={bg} style={styles.backgroundContainer}>
          <Content
            contentContainerStyle={{
              justifyContent: 'center',
              flex: 1,
              fontFamily: 'Montserrat',
            }}>
            {/* {this.state.spinner && <Loading />} */}
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} />
            </View>
            <InputGroup rounded style={styles.InputGroup}>
              <Icon
                name="ios-person"
                type="Ionicons"
                style={styles.inputIcon}
              />
              <Input
                placeholder="Username"
                placeholderTextColor="#fff"
                underlineColorAndroid={'transparent'}
                style={styles.textInput}
                onChangeText={value => this.setState({username: value})}
                value={this.state.username}
              />
            </InputGroup>
            <InputGroup iconLeft iconRight rounded style={styles.InputGroup}>
              <Icon
                name="ios-lock-closed"
                type="Ionicons"
                style={styles.inputIcon}
              />
              <Input
                placeholder="Password"
                secureTextEntry={this.state.showPass}
                placeholderTextColor="#fff"
                underlineColorAndroid={'transparent'}
                style={styles.textInput}
                onChangeText={value => this.setState({password: value})}
                value={this.state.password}
              />
              <TouchableOpacity
                styles={styles.inputIconEye}
                onPress={this.showPass.bind(this)}>
                <Icon
                  type="Ionicons"
                  name={this.state.press == false ? 'ios-eye' : 'ios-eye-off'}
                  style={styles.inputIcon}
                />
              </TouchableOpacity>
            </InputGroup>
            <Button full rounded style={styles.btnLogin} onPress={this.login}>
              <Text>LOGIN</Text>
            </Button>
            <Button
              full
              rounded
              style={styles.btnLogin}
              onPress={() => this.props.navigation.navigate('SetUpDevice')}>
              <Text>SETUP NEW DEVICE</Text>
            </Button>
          </Content>
        </ImageBackground>
      </Container>
    );
  }
  // componentDidMount(){
  //   return fetch('http://45.124.87.133/api/schedule/GetScheduleRBP?id=1&token=1&data=RBP_FAft0001_BO25_D2020-03-28')
  //   .then((response) => response.json())
  //   .then((json) => {
  //     console.log(JSON.stringify(json))
  //     return json;
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //   });
  // }
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    color: 'rgba(9, 212, 93, 0.8)',
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },

  logo: {
    width: 200,
    height: 200,
    marginBottom: 0,
  },

  textInput: {
    color: '#fff',
  },

  inputIcon: {
    color: '#fff',
    marginLeft: 20,
    marginRight: 20,
  },

  InputGroup: {
    marginTop: 10,
    marginHorizontal: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: 'green',
    borderWidth: 0.1,
  },

  btnLogin: {
    marginTop: 20,
    marginHorizontal: 25,
    backgroundColor: '#ffb22b',
  },
});
