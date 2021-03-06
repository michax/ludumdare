import { h, Component } 				from 'preact/preact';
import { shallowDiff }	 				from 'shallow-compare/index';

import NavLink							from 'com/nav-link/link';
import ButtonLink						from 'com/button-link/link';
import SVGIcon							from 'com/svg-icon/icon';

import $Asset							from '../../shrub/js/asset/asset';


export default class InputTextarea extends Component {
	constructor( props ) {
		super(props);

		this.state = {
			'cursorPos': (props.value || '').length,
			'edge': /Edge/.test(navigator.userAgent)
		};
		
		this.onInput = this.onInput.bind(this);
		this.onFileChange = this.onFileChange.bind(this);
	}

	shouldComponentUpdate( nextProps ) {
		return shallowDiff(this.props, nextProps);
	}
	
	resizeTextarea() {
		if ( this.textarea ) {
			this.textarea.style.height = 0;	/* Shockingly, this is necessary. textarea wont shrink otherwise */
			this.textarea.style.height = this.textarea.scrollHeight + 'px';
		}		
	}
	
	// After initial render
	componentDidMount() {
		this.resizeTextarea();
	}
	
	// After every update
	componentDidUpdate() {
		if ( this.textarea && this.state.edge ) {
			this.textarea.setSelectionRange(this.state.cursorPos, this.state.cursorPos);
		}

		this.resizeTextarea();
	}
	
	insertAtCursor( Text ) {
		var ta = this.textarea;
		
		// http://stackoverflow.com/a/11077016/5678759
		if ( ta.selectionStart || ta.selectionStart == '0') {	// Is Number
			var startPos = ta.selectionStart;
			var endPos = ta.selectionEnd;
			ta.value = ta.value.substring(0, startPos) + Text + ta.value.substring(endPos, ta.value.length);
		} 
		else {
			this.props.value += Text;
		}	
	}
	
	// how to preview too
	// https://codepen.io/hartzis/pen/VvNGZP
	
	onFileChange( e ) {
		if ( !this.props.user )
			return null;
		if ( e.target.files && e.target.files.length ) {
			var file = e.target.files[0];

			return $Asset.Upload(this.props.user.id, file)
				.then( r => {
					if ( r.path ) {
						this.insertAtCursor('!['+r.name+'](///raw/'+r.path+')');
						this.textarea.dispatchEvent( new Event('input') );
					}
					else {
						alert(r.message);
					}
				})
				.catch(err => {
					this.setState({ 'error': err });
				});
		}
	}
	
	onInput( e ) {
		if ( this.props.onmodify ) {
			this.props.onmodify(e);
		}
		
		if( this.state.edge ) {
			e.preventDefault();
			this.setState({'cursorPos': e.target.selectionEnd});
		}
	}

	render( props ) {
		var ShowLimit = null;
		if ( props.maxlength )
			ShowLimit = <div class="-right"><span class="-chars">{props.value.length}</span>/<span class="-limit">{props.maxlength}</span></div>;

		return (
			<div class="input-textarea">
				<div class="-textarea">
					<textarea {...props} 
						oninput={this.onInput}
						ref={(input) => { this.textarea = input; }} 
					/>
				</div>
				<div class="-footer">
					{ShowLimit}
					<div class="-left">
						<label>
							<input type="file" name="asset" style="display: none;" onchange={this.onFileChange} />
							<NavLink class="-upload"><SVGIcon baseline gap>upload</SVGIcon>Upload</NavLink>
						</label>
						<span class="if-sidebar-inline">. Supports <NavLink blank href="/markdown"><SVGIcon>markdown</SVGIcon> Markdown</NavLink> and <NavLink href="//emoji.codes/">:emoji_codes:</NavLink></span>
					</div>
				</div>
			</div>
		);
//						<NavLink class="-upload" onclick={e => {window.location = "#upload";}}><SVGIcon baseline gap>upload</SVGIcon>Upload</NavLink>

//		<NavLink class="-upload" href="#upload"><SVGIcon baseline gap>upload</SVGIcon>Upload</NavLink>
//		<span class="-upload" onclick={e => {window.location = "#upload";}}><SVGIcon baseline gap>upload</SVGIcon>Upload</span>
	}
}
