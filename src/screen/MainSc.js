import React, { Component } from "react";
// common component
import {
    Container,
    Header,
    Content,
    Footer,
    Button,
    Left,
    Right,
    Body,
    Item,
    Label,
    Input,
    H2,
    H1,
    Badge,
    Text,
    SwipeRow,
    Picker,
    Textarea,
    Fab,
    List,
    ListItem,
    Switch,
    Drawer
} from "native-base";
import {
    Image,
    StyleSheet,
    SectionList,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    RefreshControl,
    View,
    TextInput,
    Dimensions,
    Alert,
    AsyncStorage,
    ToastAndroid,
    BackHandler,
    ActivityIndicator
} from "react-native";
import {UserGrade} from './../utils/UserUtils';
import Icon from "react-native-vector-icons/Entypo";
import Modal from 'react-native-modal';
import { Actions } from "react-native-router-flux";
import { Col, Row } from "react-native-easy-grid";
import {VRChatAPIGet, VRChatImage, VRChatAPIPut} from '../utils/ApiUtils';
import {getFavoriteMap, getFavoriteWorldTag} from '../utils/MapUtils';

export default class MainSc extends Component {
    constructor(props) {
        console.info("MainSc => constructor");

        super(props);

        this.state = {
            getUserInfo:null,
            refreshing:false,
            onCount:0,
            offCount:0,
            allCount:0,
            alertCount:0,
            refreshTime:false,
            exitApp:false,
            modalVisible:true
        };
    }

    async UNSAFE_componentWillMount() {
        console.info("MainSc => componentWillMount");
        
        getFavoriteMap();
        getFavoriteWorldTag();

        Promise.all([this.getUserInfo(),this.getAlerts(),getFavoriteMap(),getFavoriteWorldTag()])
        .then(() => {
            this.setState({
                modalVisible:false
            });
        });
    }

    componentWillUnmount() {
        console.info("MainSc => componentWillUnmount");
    }

    componentDidMount() {
        console.info("MainSc => componentDidMount");
    }

    // 로그아웃 처리
    logout = () =>
    {
        console.log("MainSc => logout");

        Alert.alert(
            "안내",
            "로그아웃 하시겠습니까?",
            [
                {text: "확인", onPress: () => {
                    console.log("press logout")
                    fetch("https://api.vrchat.cloud/api/1/logout", VRChatAPIPut)
                    .then((response) => response.json())
                    .then((responseJson) => {
                        Actions.replace("loginSc");
                    });
                }},
                {text: "취소", onPress: () => {console.log("press logout")}}
            ]
        );
    }

    // 자기정보 가져옴
    getUserInfo = () =>
    {
        console.log("LoginSc => getUserInfo");

        fetch("https://api.vrchat.cloud/api/1/auth/user", VRChatAPIGet)
        .then((response) => response.json())
        .then((responseJson) => {
            this.setState({
                getUserInfo : responseJson,
                onCount : responseJson.onlineFriends.length,
                offCount : responseJson.offlineFriends.length
            });
        })
    }

    getAlerts() {
        console.info("MainSc => getAlerts");

        fetch("https://api.vrchat.cloud/api/1/auth/user/notifications", VRChatAPIGet)
        .then(responses => responses.json())
        .then(json => {
            this.setState({
                alertCount:json.filter((v) => v.type.indexOf("friendRequest") !== -1).length
            })
        })
    }

    // 새로고침 시 5초 카운팅기능
    reset = () =>
    {
        console.log("LoginSc => reset");

        if(this.state.refreshTime == false)
        {
            this.state.refreshTime = true;
            this.state.modalVisible = true;

            setTimeout(() => {
                this.state.refreshTime = false;
            }, 5000);
            
            getFavoriteMap();
            getFavoriteWorldTag();

            Promise.all([this.getUserInfo(),this.getAlerts()])
            .then(() => {
                this.setState({
                    modalVisible:false
                });
            });

            this.setState({
                refreshing:false
            });
        }
        else
        {
            ToastAndroid.show("새로고침은 5초에 한번 가능합니다.", ToastAndroid.SHORT);
        }
    }

    render() {
        console.info("MainSc => render");

        this.state.allCount = this.state.onCount + this.state.offCount;

        return (
            <ScrollView
                refreshControl={
                    <RefreshControl
                        onRefresh={this.reset.bind(this)}
                        refreshing={this.state.refreshing}
                    />
                }
                >
                <View>
                    <View style={{alignItems:"flex-start",marginLeft:"5%"}}>
                        <Button
                            onPress={this.logout.bind(this)}
                            style={{marginTop:10,width:100,justifyContent:"center"}}
                            >
                            <Text>로그아웃</Text>
                        </Button>
                    </View>
                    {/* 
                    setting button
                    <View style={{position:"absolute",right:"0%",margin:"2%"}}>
                        <Icon
                        name="cog" size={30}
                        />
                    </View> */}
                </View>
                <View style={styles.topMain}>
                    {
                        this.state.getUserInfo != null ? 
                        <Image
                            style={{width: 100, height: 100, borderRadius:20, borderWidth:3, borderColor: UserGrade(this.state.getUserInfo.tags)}}
                            source={VRChatImage(this.state.getUserInfo.currentAvatarImageUrl)}
                        />
                        : null
                    }
                    <Text style={{textAlign:"center"}}>
                        {this.state.getUserInfo != null && this.state.getUserInfo.displayName}{"\n"}
                        {this.state.getUserInfo != null && this.state.getUserInfo.statusDescription}{"\n"}
                    </Text>
                    <Row>
                        <Col>
                            <Text style={styles.friendsInfo}>
                                전체{"\n"}
                                {this.state.allCount+"명"}
                            </Text>
                        </Col>
                        <Col>
                            <Text style={styles.friendsInfo}>
                                온라인{"\n"}
                                {this.state.onCount+"명"}
                            </Text>
                        </Col>
                        <Col>
                            <Text style={styles.friendsInfo}>
                                오프라인{"\n"}
                                {this.state.offCount+"명"}
                            </Text>
                        </Col>
                    </Row>
                </View>
                <View style={styles.menu}>
                    <Button
                    onPress={Actions.alertSc}
                    style={styles.infoButton}>
                        <Text>알림{"  "}{this.state.alertCount}</Text>
                    </Button>
                    <Button
                    onPress={Actions.friendListSc}
                    style={styles.infoButton}>
                        <Text>친구목록</Text>
                    </Button>
                    <Button
                    onPress={Actions.mapListSc}
                    style={styles.infoButton}>
                        <Text>맵 목록</Text>
                    </Button>
                    <Button
                    onPress={Actions.avatarListSc}
                    style={styles.infoButton}>
                        <Text>아바타 목록</Text>
                    </Button>
                    <Button
                    onPress={Actions.favoriteSc}
                    style={styles.infoButton}>
                        <Text>즐겨찾기 관리</Text>
                    </Button>
                    <Button
                    onPress={Actions.blockSc}
                    style={styles.infoButton}>
                        <Text>블락 관리</Text>
                    </Button>
                </View>
                <Modal
                isVisible={this.state.modalVisible}>
                    <ActivityIndicator size={100}/>
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    topMain: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop:"5%",
        paddingRight:"5%",
        paddingLeft:"5%",
        paddingBottom:"5%",
    },
    friendsInfo: {
        textAlign:"center",
    },
    menu: {
        flex:1,
        flexWrap:"wrap",
        flexDirection:"row",
        marginTop:"-5%",
        justifyContent:"center",
        marginTop:"2%",
        height:parseInt(Dimensions.get('window').width / 100 * 110),
    },
    textView:{
        borderBottomWidth:1,
        borderBottomColor:"#000",
        width:"80%",
        flexDirection:"row",
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    infoButton:{
        alignItems: 'center',
        justifyContent: 'center',
        fontSize:25,
        width:"45%",
        marginTop:10,
        height:parseInt(Dimensions.get('window').width / 100 * 32),
        margin:5,
        borderRadius:20
    }
});