/* @flow */

import React, { Component } from 'react';
import { NavigationExperimental } from 'react-native';
import { warnOutOfSycn } from './warningUtil';
import { globalStyles as styles } from './styles';

import type { EnhancedNavigationState } from './TypeDefinition';

const {
  Card: NavgationCard,
  AnimatedView: NavigationAnimatedView,
  PropTypes: NavigationPropTypes,
} = NavigationExperimental;

const {
  SceneRenderer: NavigationSceneRendererProps,
} = NavigationPropTypes;

const {
  PagerStyleInterpolator: NavgationPagerStyleInterpolator,
  CardStackPanResponder: NavigationCardStackPanResponder,
} = NavgationCard;

type Props = {
  path: string,
  type: string,
  navigationComponent: ReactClass,
  overlayComponent: ?ReactClass,
  navScenes: ?Array<ReactElement>,
  _navigationState: EnhancedNavigationState,
};

class StackView extends Component<any, Props, any> {

  static propTypes = {
    path: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    navigationComponent: React.PropTypes.any.isRequired,
    overlayComponent: React.PropTypes.any,
    navScenes: React.PropTypes.arrayOf(React.PropTypes.element),
    _navigationState: React.PropTypes.object,
  };

  componentWillMount(): void {
    (this: any).renderScene = this.renderScene.bind(this);
    (this: any).renderOverlay = this.renderOverlay.bind(this);
    (this: any).renderCardScene = this.renderCardScene.bind(this);
  }

  renderOverlay(props: NavigationSceneRendererProps): ?ReactElement {
    const { scene } = props;

    const { navScenes } = this.props;
    if (!navScenes) {
      return null;
    }

    const el = navScenes.find(navScene => navScene.props.path === scene.navigationState.path);
    if (!el) {
      warnOutOfSycn('Cannot render overlay', props);
    }

    const overlayComponent = el.props.overlayComponent;
    if (overlayComponent) {
      const { location, params, routeParams } = scene.navigationState;
      return React.createElement(overlayComponent, { ...props, location, params, routeParams });
    }

    return null;
  }

  renderScene(props: NavigationSceneRendererProps) {
    const { scene } = props;

    if (!scene.navigationState) {
      return null;
    }

    const viewStyle = NavgationPagerStyleInterpolator.forHorizontal(props);
    const panHandlers = NavigationCardStackPanResponder.forHorizontal(props);

    return (
      <NavgationCard
        key={scene.navigationState.key}
        style={[viewStyle, styles.navigationCard]}
        panHandlers={panHandlers}
        {...props}
        renderScene={this.renderCardScene}
      />
    );
  }

  renderCardScene(props: NavigationSceneRendererProps): ?ReactElement {
    const { scene } = props;

    const { navScenes } = this.props;
    if (!navScenes) {
      return null;
    }

    const el = navScenes.find(navScene => navScene.props.path === scene.navigationState.path);
    if (!el) {
      warnOutOfSycn('Cannot render card', props);
    }

    return React.cloneElement(el, { _navigationState: scene.navigationState });
  }

  render(): ReactElement {
    const { navScenes, _navigationState, navigationComponent: NavigationComponent } = this.props;
    const { children, params, routeParams, location } = _navigationState;

    let wrappedChildren;
    if (navScenes && children && children.length > 0) {
      wrappedChildren = (
        <NavigationAnimatedView
          style={styles.wrapper}
          navigationState={_navigationState}
          renderScene={this.renderScene}
          renderOverlay={this.renderOverlay}
        />
      );
    }

    return (
      <NavigationComponent params={params} routeParams={routeParams} location={location}>
        {wrappedChildren}
      </NavigationComponent>
    );
  }

}

export default StackView;