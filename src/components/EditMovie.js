import React, { Component, Fragment } from "react";
import "./EditMovie.css";
import Input from './form-components/Input';
import TextArea from './form-components/TextArea';
import Select from './form-components/Select';

export default class EditMovie extends Component {
    constructor(props) {
        super(props);
        this.state = {
            movie: {
                id: 0,
                title: "",
                release_date: "",
                runtime: "",
                mpaa_rating: "",
                rating: "",
                description: "",
            },
            mpaaOptions: [
                {id: "G", value: "G"},
                {id: "PG", value: "PG"},
                {id: "PG13", value: "PG13"},
                {id: "R", value: "R"},
                {id: "NC17", value: "NC17"},
            ],
            isLoaded: false,
            error: null,
            errors : [],
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit = (evt) => {
        evt.preventDefault();
        // client side validation
        let errors = [];
        if (this.state.movie.title=== ""){
            errors.push("title");
        }
        if (this.state.movie.release_date=== ""){
            errors.push("release_date");
        }
        if (this.state.movie.runtime=== ""){
            errors.push("runtime");
        }
        if (this.state.movie.rating=== ""){
            errors.push("rating");
        }
        if (this.state.movie.description=== ""){
            errors.push("description");
        }
        this.setState({errors: errors});

        if (errors.length > 0){
            return false;
        }

        // grape tha data from the form
        const data =new FormData(evt.target);
        // convert to payload
        const payload =Object.fromEntries(data.entries());
        // console.log(payload);
        // write the request to POST the payload
        const requestOptions ={
            method: 'POST',
            body: JSON.stringify(payload),
        }
        // fetch the payload data
        fetch('http://localhost:4000/v1/admin/editmovie', requestOptions)
            .then(response => response.json())
            .then(data=>{
                console.log(data);
        })

    };

    handleChange = (evt) => {
        let value = evt.target.value;
        let name = evt.target.name;
        this.setState((prevState) => ({
            movie: {
                ...prevState.movie,
                [name]: value,
            }
        }))
    };

    // check if found an error for the key, return the index of it in the  errors array
    hasError(key){
        return this.state.errors.indexOf(key) !== -1;
    }


    componentDidMount() {
        // check the id,if id gt zero then go get the movie from the db

        const id = this.props.match.params.id;
        if (id > 0) {
            fetch("http://localhost:4000/v1/movie/" + id)
                .then((response) => {
                    if (response.status !== "200") {
                        let err = Error;
                        err.Message = "Invalid response code: " + response.status;
                        this.setState({ error: err });
                    }
                    return response.json();
                })
                .then((json) => {
                    const releaseDate = new Date(json.movie.release_date);

                    this.setState(
                        {
                            movie: {
                                id: id,
                                title: json.movie.title,
                                release_date: releaseDate.toISOString().split("T")[0],
                                runtime: json.movie.runtime,
                                mpaa_rating: json.movie.mpaa_rating,
                                rating: json.movie.rating,
                                description: json.movie.description,
                            },
                            isLoaded: true,
                        },
                        (error) => {
                            this.setState({
                                isLoaded: true,
                                error,
                            });
                        }
                    );
                });
        } else {
            this.setState({ isLoaded: true });
        }
    }

    render() {
        let { movie, isLoaded, error } = this.state;

        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <p>Loading...</p>;
        } else {
            return (
                <Fragment>
                    <h2>Add/Edit Movie</h2>
                    <hr/>
                    <form onSubmit={this.handleSubmit}>
                        <input
                            type="hidden"
                            name="id"
                            id="id"
                            value={movie.id}
                            onChange={this.handleChange}
                        />
                        <Input
                            title={"Title"}
                            className={this.hasError("title") ? "is-invalid" : ""}
                            type={'text'}
                            name={'title'}
                            value={movie.title}
                            handleChange={this.handleChange}
                            errorDiv={this.hasError("title") ? "text-danger" : "d-none"}
                            errorMsg={"Pleas enter a title"}
                        />

                        <Input
                            title={"Release Date"}
                            type={'date'}
                            name={'release_date'}
                            value={movie.release_date}
                            handleChange={this.handleChange}
                            errorDiv={this.hasError("release_date") ? "text-danger" : "d-none"}
                            errorMsg={"Pleas enter a release date"}

                        />


                        <Input
                            title={"Runtime"}
                            type={'text'}
                            name={'runtime'}
                            value={movie.runtime}
                            handleChange={this.handleChange}
                            errorDiv={this.hasError("runtime") ? "text-danger" : "d-none"}
                            errorMsg={"Pleas enter a release runtime"}
                        />


                        <Input
                            title={"Rating"}
                            type={'text'}
                            name={'rating'}
                            value={movie.rating}
                            handleChange={this.handleChange}
                            errorDiv={this.hasError("rating") ? "text-danger" : "d-none"}
                            errorMsg={"Pleas enter a rating"}
                        />

                        <Select
                            title={'MPAA Rating'}
                            name={'mpaa_rating'}
                            options={this.state.mpaaOptions}
                            value={movie.mpaa_rating}
                            handleChange={this.handleChange}
                            placeholder={'Choose...'}
                        />


                        <TextArea
                            title={"Description"}
                            name={"description"}
                            value={movie.description}
                            rows={"3"}
                            handleChange={this.handleChange}
                            errorDiv={this.hasError("description") ? "text-danger" : "d-none"}
                            errorMsg={"Pleas enter a description"}

                        />
                        <hr/>

                        <button className="btn btn-primary">Save</button>
                    </form>
                    <div className="mt-3">
                        <pre>{JSON.stringify(this.state, null, 3)}</pre>
                    </div>
                </Fragment>
            );
        }
    }
}