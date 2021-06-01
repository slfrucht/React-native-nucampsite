import React, { Component } from "react";
import {Text, View, ScrollView, FlatList, Modal, Button, StyleSheet, Alert, PanResponder} from "react-native";
import {Card, Icon, Rating, Input} from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl} from "../shared/baseUrl";
import { postFavorite, postComment } from "../redux/ActionCreators";
import * as Animatable from "react-native-animatable";

const mapStateToProps = state => {
    return {
        campsites: state.campsites,
        comments: state.comments,
        favorites: state.favorites
    };
};

const mapDispatchToProps = {
    postFavorite: campsiteId => (postFavorite(campsiteId)),
    postComment: (campsiteId, rating, author, text) => (postComment(campsiteId, rating, author, text))
};

function RenderCampsite(props) {
    const {campsite} = props;

    const view = React.createRef();

    const recognizeDrag = ({dx}) => (dx < -200) ? true : false;
    const recognizeComment = ({dx}) => (dx > 200) ? true : false;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            view.current.rubberBand(1000)
            .then(endState => console.log(endState.finished ? "finished" : "canceled"));

        },
        onPanResponderEnd: (e, gestureState) => {
            console.log("gesture end: ", gestureState);
            if(recognizeDrag(gestureState)) {
                Alert.alert(
                    "Add Favorite",
                    "Are you sure you want to add" + campsite.name + " to favorites?",
                    [
                        {
                            text: "Cancel",
                            style: "cancel",
                            onPress: () => console.log("Cancel pressed")
                        },
                        {
                            text: "OK",
                            onPress: () => props.favorite ? console.log("Already marked as favorite") : props.markFavorite()
                        }
                    ],
                    { cancellable: false }
                )
            }
            else if(recognizeComment(gestureState)) {
                props.onShowModal();
            }
            return true;
        }
    });

        if(campsite) {
            return(
                <Animatable.View 
                animation="fadeInDown" 
                duration={2000} 
                delay={1000}
                ref={view}
                {...panResponder.panHandlers}
                >
                <Card
                featuredTitle={campsite.name}
                image={{uri: baseUrl + campsite.image}}>
                    <Text style={{margin:10}}>
                        {campsite.description}
                    </Text>
                    <View style={styles.cardRow}>
                    <Icon 
                    name={props.favorite ? "heart" : "heart-o"}
                    type="font-awesome"
                    color="#f50"
                    raised
                    reverse
                    onPress={() => props.favorite ? console.log("Already marked as favorite") : props.markFavorite()}
                    />
                    <Icon 
                    name={"pencil"}
                    type="font-awesome"
                    color="#5637DD"
                    raised
                    reverse
                    onPress={() => props.onShowModal()}
                    />
                    </View>
                </Card>
                </Animatable.View>
            )
        }
        return <View />;
}

function RenderComments({comments}) {

    const renderCommentItem = ({item}) => {
        return(
            <View style={{margin:10}}>
                <Text style={{fontSize:14}}>{item.text}</Text>
                <Rating 
                startingValue={item.rating}
                imageSize={10}
                readonly={true}
                style={{alignItems:"flex-start", paddingVertical:"5%"}}
               />
                <Text style={{fontSize:10}}>{` -- ${item.author}, ${item.date}`} </Text>
            </View>
        )
    }
    if(comments) {
        return(
            <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title="Comments">
                <FlatList
                data={comments}
                renderItem = {renderCommentItem}
                keyExtractor = {item => item.id.toString()}
                />
            </Card>
            </Animatable.View>
        );
    }
    return <View />;

}
class CampsiteInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            rating: 5,
            author: "",
            text: ""
        };
    }

    markFavorite(campsiteId) {
        this.props.postFavorite(campsiteId);
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    handleComment(campsiteId) {
        console.log("in CampsiteInfo===== " + JSON.stringify(this.state));
        this.props.postComment(campsiteId, this.state.rating, this.state.author, this.state.text);

        this.toggleModal();
    }
    resetForm() {
        this.setState(
            {
                showModal: false,
                rating: 5,
                author: "",
                text: ""
            }
        );
    }



    static navigationOptions = {
        title: "Campsite Information"
    };


    render() {
        const campsiteId = this.props.navigation.getParam("campsiteId");
        const campsite = this.props.campsites.campsites.filter(campsite => campsite.id === campsiteId)[0];
        const campsiteComments = this.props.comments.comments.filter(comment => comment.campsiteId === campsiteId);

        return (
            <ScrollView>
                <RenderCampsite campsite={campsite}
                favorite={this.props.favorites.includes(campsiteId)}
                markFavorite={() => this.markFavorite(campsiteId)}
                onShowModal={() => this.toggleModal()}
                />
                <RenderComments 
                comments={campsiteComments}
                />
                <Modal
                animationType={"slide"}
                transparent={false}
                visible={this.state.showModal}
                onRequestClose={() => this.toggleModal()}
                >
                    <View  style={styles.modal}>
                        <Rating
                        showRating
                        startingValue={this.state.rating}
                        imagesize={40}
                        onFinishRating={rating => this.setState({rating: rating})}
                        style={{paddingVertical: 10}}
                        />
                        <Input
                        placeholder="Enter Author"
                        leftIcon= {
                            <Icon 
                            name="user-o"
                            type="font-awesome"
                            />
                        }
                        leftIconContainerStyle={
                            {paddingRight:10}
                        }
                        onChangeText={value => this.setState({author: value})}  
                        />
                        <Input
                        placeholder="Enter Comment"
                        multiline={true}
                        leftIcon= {
                            <Icon 
                            name="comment-o"
                            type="font-awesome"
                            />
                        }
                        leftIconContainerStyle={
                            {paddingRight:10}
                        }
                        onChangeText={value => this.setState({text: value})}  
                        />

                    <View style={{margin: 10}} >
                    <Button 
                    style={{margin: 20}}
                    onPress={() => {
                        this.toggleModal();
                        this.resetForm();
                    }}
                    color="#808080"
                    title="Cancel"
                    />
                    <Button 
                    style={{margin: 20, paddingVertical:10}}
                    onPress={() => {
                        this.handleComment(campsiteId);
                        this.resetForm();
                    }}
                    color="#5637DD"
                    title="Submit"
                    />

                    </View>
                    </View>

                </Modal>                
            </ScrollView>
        );
    }

}

const styles = StyleSheet.create({  
    cardRow: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        flexDirection: "row",
        margin: 20
    },
    modal: {
        justifyContent: "center",
        margin: 20
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo);