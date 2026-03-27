import { Component } from 'react'; 
 
 export class ErrorBoundary extends Component { 
   state = { hasError: false, error: null }; 
 
   static getDerivedStateFromError(error) { 
     return { hasError: true, error }; 
   } 
 
   handleReset = () => { 
     if (confirm('Reset all local data? This cannot be undone.')) { 
       localStorage.clear(); 
       window.location.reload(); 
     } 
   }; 
 
   render() { 
     if (!this.state.hasError) return this.props.children; 
     return ( 
       <div style={{ padding: '2rem', textAlign: 'center' }}> 
         <h2>Something went wrong</h2> 
         <pre style={{ fontSize: 12, opacity: 0.6, margin: '1rem 0' }}> 
           {this.state.error?.message} 
         </pre> 
         <button onClick={this.handleReset}>Reset app data</button> 
       </div> 
     ); 
   } 
 } 
