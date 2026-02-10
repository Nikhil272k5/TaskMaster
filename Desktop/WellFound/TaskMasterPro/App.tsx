/**
 * App.tsx — Root entry component
 * Wraps with Redux Provider and GestureHandlerRootView
 */
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import store from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

const App: React.FC = () => (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
            <AppNavigator />
        </Provider>
    </GestureHandlerRootView>
);

export default App;
