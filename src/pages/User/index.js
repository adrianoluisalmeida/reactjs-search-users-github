import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {TouchableOpacity} from 'react-native';

import api from '../../services/api';
import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Loading,
  Title,
  Autor,
  Info,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.getParam('user').name,
  });

  static PropTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
    refreshing: true,
  };

  refreshList = async () => {
    this.state({refreshing: true, stars: []}, this.loadStarred);
  };

  loadStarred = async (page = 1) => {
    const {navigation} = this.props;
    const {stars} = this.state;

    const user = navigation.getParam('user');

    const response = await api.get(
      `/users/${user.login}/starred?page=${page}`,
      {
        params: {page},
      }
    );

    this.setState({
      stars: page >= 2 ? [...stars, ...response.data] : response.data,
      page,
      loading: false,
      refreshing: false,
    });
  };

  async componentDidMount() {
    this.loadStarred();
  }

  handleNavigate = repository => {
    console.tron.log(repository);
    const {navigation} = this.props;

    navigation.navigate('Repository', {repository});
  };

  loadMore = async () => {
    const {page} = this.state;

    const next = page + 1;

    this.loadStarred(next);
  };

  render() {
    const {navigation} = this.props;
    const {stars, refreshing, loading} = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{uri: user.avatar}} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <Loading />
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onEndReachedThreshold={0.1}
            onEndReached={this.loadMore}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => this.handleNavigate(item)}
                activeOpacity={0.8}>
                <Starred>
                  <OwnerAvatar source={{uri: item.owner.avatar_url}} />
                  <Info>
                    <Title>{item.owner.name}</Title>
                    <Autor>{item.owner.login} </Autor>
                  </Info>
                </Starred>
              </TouchableOpacity>
            )}
          />
        )}
      </Container>
    );
  }
}
